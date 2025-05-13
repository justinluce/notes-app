// Use `dotnet run` to run the backend

using SignalRChat.Hubs;

var builder = WebApplication.CreateBuilder(args);

// Ensures that every Hub instance uses the same underlying state
builder.Services.AddSingleton<DocumentService>();
builder.Services.AddSingleton<IUserService, UserService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy => policy.WithOrigins("http://localhost:5173")
                                    .AllowAnyHeader()
                                    .AllowAnyMethod()
                                    .AllowCredentials());
});

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddSignalR();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// Not using HTTPS for development; will need this for https certificate
// app.UseHttpsRedirection();
app.UseCors("AllowReactApp");

app.MapHub<ChatHub>("/chatHub");

app.Run();
