using System.Security.Claims;
using Duende.Bff.Yarp;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Talabat.Admin.DFF;
using Talabat.Admin.DFF.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddBff()
    .AddRemoteApis();

Configuration config = new();
builder.Configuration.Bind("BFF", config);
builder.Services.AddSingleton(config);

builder.Services.AddHttpClient("TalabatApi", client =>
{
    client.BaseAddress = new Uri(config.TalabatApiUrl ?? config.Authority!);
});
builder.Services.AddHttpClient();
builder.Services.AddSingleton<TokenExchangeService>();

builder.Services.AddAuthentication(options =>
    {
        options.DefaultScheme = "cookie";
        options.DefaultChallengeScheme = "oidc";
        options.DefaultSignOutScheme = "oidc";
    })
    .AddCookie("cookie", options =>
    {
        options.Cookie.Name = "__Host-bff";
        options.Cookie.SameSite = SameSiteMode.Strict;
    })
    .AddOpenIdConnect("oidc", options =>
    {
        options.Authority = config.Authority;
        options.ClientId = config.ClientId;
        options.ClientSecret = config.ClientSecret;

        options.ResponseType = "code";
        options.ResponseMode = "query";
        options.UsePkce = true;

        options.GetClaimsFromUserInfoEndpoint = true;
        options.MapInboundClaims = false;
        options.SaveTokens = true;

        options.Scope.Clear();
        foreach (var scope in config.Scopes)
        {
            options.Scope.Add(scope);
        }

        options.TokenValidationParameters = new()
        {
            NameClaimType = "name",
            RoleClaimType = "role"
        };

        //options.Events = new OpenIdConnectEvents
        //{
        //    OnTicketReceived = async context =>
        //    {
        //        var tokenExchangeService = context.HttpContext.RequestServices
        //            .GetRequiredService<TokenExchangeService>();
        //        var logger = context.HttpContext.RequestServices
        //            .GetRequiredService<ILogger<Program>>();

        //        var properties = context.Properties!;
        //        var accessToken = properties.GetTokenValue("access_token");
        //        if (string.IsNullOrEmpty(accessToken))
        //            return;

        //        try
        //        {
        //            var accounts = await tokenExchangeService.GetAccountsAsync(accessToken);

        //            var account = accounts
        //                .FirstOrDefault(a =>
        //                    string.Equals(a.TenantType, "system", StringComparison.OrdinalIgnoreCase)
        //                    && a.TenantId == null);

        //            if (account == null)
        //            {
        //                logger.LogInformation("No system account found for user, keeping sub-only token");
        //                return;
        //            }

        //            var exchangeResult = await tokenExchangeService.ExchangeTokenAsync(
        //                accessToken, account.Id.ToString(), account.Version);

        //            if (exchangeResult == null)
        //            {
        //                logger.LogWarning("Token exchange failed, falling back to sub-only token");
        //                return;
        //            }

        //            var tokens = new List<AuthenticationToken>
        //            {
        //                new() { Name = "access_token", Value = exchangeResult.AccessToken },
        //                new() { Name = "token_type", Value = "Bearer" },
        //                new() { Name = "expires_at", Value = DateTimeOffset.UtcNow.AddSeconds(exchangeResult.ExpiresIn).ToString("o") }
        //            };

        //            if (!string.IsNullOrEmpty(exchangeResult.RefreshToken))
        //            {
        //                tokens.Add(new AuthenticationToken { Name = "refresh_token", Value = exchangeResult.RefreshToken });
        //            }

        //            var idToken = properties.GetTokenValue("id_token");
        //            if (!string.IsNullOrEmpty(idToken))
        //            {
        //                tokens.Add(new AuthenticationToken { Name = "id_token", Value = idToken });
        //            }

        //            properties.StoreTokens(tokens);

        //            // Add account claims to the session so /bff/user exposes them
        //            var identity = context.Principal?.Identity as ClaimsIdentity;
        //            if (identity != null)
        //            {
        //                identity.AddClaim(new Claim("account_id", account.Id.ToString()));
        //                identity.AddClaim(new Claim("account_version", account.Version));
        //                identity.AddClaim(new Claim("account_name", account.Name));
        //                identity.AddClaim(new Claim("account_tenant_type", account.TenantType));
        //                if (account.TenantId.HasValue)
        //                    identity.AddClaim(new Claim("account_tenant_id", account.TenantId.Value.ToString()));

        //                foreach (var role in account.Roles)
        //                {
        //                    identity.AddClaim(new Claim("role", role.RoleName ?? role.RoleId.ToString()));
        //                    foreach (var permission in role.Permissions)
        //                    {
        //                        identity.AddClaim(new Claim("permission", permission));
        //                    }
        //                }
        //            }

        //            logger.LogInformation("Token exchange successful for account {AccountId}", account.Id);
        //        }
        //        catch (Exception ex)
        //        {
        //            logger.LogError(ex, "Error during account resolution/token exchange, falling back to sub-only token");
        //        }
        //    }
        //};
    });

builder.Services.AddAuthorization();

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseBff();
app.UseAuthorization();

app.MapBffManagementEndpoints();

if (config.Apis.Any())
{
    foreach (var api in config.Apis)
    {
        app.MapRemoteBffApiEndpoint(api.LocalPath, api.RemoteUrl!)
            .RequireAccessToken(api.RequiredToken);

        app.Logger.LogInformation("Mapped BFF API: {LocalPath} -> {RemoteUrl}", api.LocalPath, api.RemoteUrl);
    }
}

app.MapSwitchAccountEndpoint();

app.MapFallbackToFile("/index.html");

app.Run();
