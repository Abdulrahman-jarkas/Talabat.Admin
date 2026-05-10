using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Talabat.Admin.DFF.Services;

namespace Talabat.Admin.DFF;

public static class SwitchAccountEndpoint
{
    public static void MapSwitchAccountEndpoint(this WebApplication app)
    {
        app.MapPost("/bff/switch-account", HandleAsync)
            .RequireAuthorization()
            .AsBffApiEndpoint();
    }

    private static async Task<IResult> HandleAsync(
        HttpContext httpContext,
        TokenExchangeService tokenExchangeService,
        ILogger<Program> logger)
    {
        var request = await httpContext.Request.ReadFromJsonAsync<SwitchAccountRequest>();
        if (request is null || string.IsNullOrEmpty(request.AccountId))
            return Results.BadRequest("accountId is required");

        var accessToken = await httpContext.GetTokenAsync("access_token");
        if (string.IsNullOrEmpty(accessToken))
            return Results.Unauthorized();

        var accounts = await tokenExchangeService.GetAccountsAsync(accessToken);
        var account = accounts.FirstOrDefault(a => a.Id.ToString() == request.AccountId);
        if (account is null)
            return Results.NotFound("Account not found");

        var exchangeResult = await tokenExchangeService.ExchangeTokenAsync(
            accessToken, request.AccountId, account.Version);

        if (exchangeResult is null)
            return Results.Problem("Token exchange failed");

        var authenticateResult = await httpContext.AuthenticateAsync("cookie");
        if (!authenticateResult.Succeeded)
            return Results.Unauthorized();

        var properties = authenticateResult.Properties!;
        var idToken = properties.GetTokenValue("id_token");

        var tokens = new List<AuthenticationToken>
        {
            new() { Name = "access_token", Value = exchangeResult.AccessToken },
            new() { Name = "token_type", Value = "Bearer" },
            new() { Name = "expires_at", Value = DateTimeOffset.UtcNow.AddSeconds(exchangeResult.ExpiresIn).ToString("o") }
        };

        if (!string.IsNullOrEmpty(exchangeResult.RefreshToken))
            tokens.Add(new AuthenticationToken { Name = "refresh_token", Value = exchangeResult.RefreshToken });

        if (!string.IsNullOrEmpty(idToken))
            tokens.Add(new AuthenticationToken { Name = "id_token", Value = idToken });

        properties.StoreTokens(tokens);

        if (authenticateResult.Principal?.Identity is ClaimsIdentity identity)
        {
            var claimsToRemove = identity.Claims
                .Where(c => c.Type is "account_id" or "account_version" or "account_name"
                    or "account_tenant_type" or "account_tenant_id" or "role" or "permission")
                .ToList();

            foreach (var claim in claimsToRemove)
                identity.RemoveClaim(claim);

            identity.AddClaim(new Claim("account_id", account.Id.ToString()));
            identity.AddClaim(new Claim("account_version", account.Version));
            identity.AddClaim(new Claim("account_name", account.Name));
            identity.AddClaim(new Claim("account_tenant_type", account.TenantType));

            if (account.TenantId.HasValue)
                identity.AddClaim(new Claim("account_tenant_id", account.TenantId.Value.ToString()));

            foreach (var role in account.Roles)
            {
                identity.AddClaim(new Claim("role", role.RoleName ?? role.RoleId.ToString()));
                foreach (var permission in role.Permissions)
                    identity.AddClaim(new Claim("permission", permission));
            }
        }

        await httpContext.SignInAsync("cookie", authenticateResult.Principal!, properties);

        logger.LogInformation("Account switched to {AccountId} for user", account.Id);
        return Results.Ok(new { message = "Account switched successfully" });
    }

    private record SwitchAccountRequest(string AccountId, string AccountVersion);
}
