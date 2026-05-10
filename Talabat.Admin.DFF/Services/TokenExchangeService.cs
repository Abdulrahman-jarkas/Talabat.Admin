using System.Net.Http.Headers;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Talabat.Admin.DFF.Services;

public class TokenExchangeService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly Configuration _config;
    private readonly ILogger<TokenExchangeService> _logger;

    public TokenExchangeService(
        IHttpClientFactory httpClientFactory,
        Configuration config,
        ILogger<TokenExchangeService> logger)
    {
        _httpClientFactory = httpClientFactory;
        _config = config;
        _logger = logger;
    }

    public async Task<List<AccountDto>> GetAccountsAsync(string accessToken)
    {
        var client = _httpClientFactory.CreateClient("TalabatApi");
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        var response = await client.GetAsync("/api/accounts/me");
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadAsStringAsync();
        var wrapper = JsonSerializer.Deserialize<ApiResponse<List<AccountDto>>>(json, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });
        return wrapper?.Data ?? [];
    }

    public async Task<TokenExchangeResponse?> ExchangeTokenAsync(
        string subjectToken,
        string accountId,
        string accountVersion)
    {
        var client = _httpClientFactory.CreateClient();

        var parameters = new Dictionary<string, string>
        {
            ["grant_type"] = "urn:ietf:params:oauth:grant-type:token-exchange",
            ["subject_token"] = subjectToken,
            ["subject_token_type"] = "urn:ietf:params:oauth:token-type:access_token",
            ["account_id"] = accountId,
            ["account_version"] = accountVersion,
            ["client_id"] = _config.ClientId!,
            ["client_secret"] = _config.ClientSecret!,
            ["scope"] = string.Join(" ", _config.Scopes)
        };

        var request = new HttpRequestMessage(HttpMethod.Post, $"{_config.Authority}/connect/token")
        {
            Content = new FormUrlEncodedContent(parameters)
        };

        try
        {
            var response = await client.SendAsync(request);
            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                _logger.LogWarning("Token exchange failed: {StatusCode} {Error}", response.StatusCode, error);
                return null;
            }

            var json = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<TokenExchangeResponse>(json, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Token exchange request failed");
            return null;
        }
    }
}

public class AccountDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = default!;
    public string TenantType { get; set; } = default!;
    public Guid? TenantId { get; set; }
    public string Version { get; set; } = default!;
    public List<AccountRoleDto> Roles { get; set; } = [];
}

public class AccountRoleDto
{
    public Guid RoleId { get; set; }
    public string? RoleName { get; set; }
    public List<string> Permissions { get; set; } = [];
}

public class TokenExchangeResponse
{
    [JsonPropertyName("access_token")]
    public string AccessToken { get; set; } = default!;

    [JsonPropertyName("token_type")]
    public string TokenType { get; set; } = default!;

    [JsonPropertyName("expires_in")]
    public int ExpiresIn { get; set; }

    [JsonPropertyName("refresh_token")]
    public string? RefreshToken { get; set; }

    [JsonPropertyName("scope")]
    public string? Scope { get; set; }
}

public class ApiResponse<T>
{
    public bool Success { get; set; }
    public T? Data { get; set; }
    public object? Errors { get; set; }
}
