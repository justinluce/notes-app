using Microsoft.AspNetCore.SignalR;

namespace SignalRChat.Hubs
{
    public class ChatHub : Hub
    {
        private readonly DocumentService _documentService;
        private readonly IUserService _userService;

        public ChatHub(DocumentService documentService, IUserService userService) {
            _documentService = documentService;
            _userService = userService;
        }

        public async Task UpdateDocument(string user, string newContent) {
            _documentService.UpdateContent(newContent);
            System.Console.WriteLine(newContent);
            await Clients.All.SendAsync("ReceiveDocumentUpdate", _documentService.GetContent());
        }
        public async Task SendMessage(string user, string message) {
            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }
        public async Task AddUser(string user) {
            _userService.AddUser(user);
            await Clients.All.SendAsync("ReceiveUsers", _userService.Users);
        }
    }
}