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

        public async Task UpdateDocument(string documentId, string user, string newContent) {
            _documentService.UpdateContent(newContent);
            // Send update only to users in the document's group
            await Clients.Group(documentId).SendAsync("ReceiveDocumentUpdate", newContent);
        }

        public async Task JoinDocumentGroup(string documentId, string user) {
            await Groups.AddToGroupAsync(Context.ConnectionId, documentId);
            await AddUser(user, documentId);
            await Clients.Group(documentId).SendAsync("ReceiveMessage", $"{user} has joined the document.");
        }

        public async Task LeaveDocumentGroup(string documentId, string user) {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, documentId);
            await RemoveUser(user, documentId);
            await Clients.Group(documentId).SendAsync("ReceiveMessage", $"{user} has left the document.");
        }

        public async Task SendMessage(string user, string message) {
            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }

        public async Task AddUser(string user, string groupName) {
            _userService.AddUser(user, groupName);
            await Clients.Group(groupName).SendAsync("ReceiveUsers", _userService.Users);
        }

        public async Task RemoveUser(string user, string groupName) {
            _userService.RemoveUser(user, groupName);
            await Clients.Group(groupName).SendAsync("ReceiveUsers", _userService.Users);
        }

        public async Task GetUsersInDocument(string documentId) {
            await Clients.Group(documentId).SendAsync("ReceiveUsers", _userService.Users);
        }
    }
}