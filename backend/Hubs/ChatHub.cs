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
        public async Task AddUser(string user, string groupName) {
            _userService.AddUser(user, groupName);
            await Clients.All.SendAsync("ReceiveUsers", _userService.Users);
        }
        public async Task RemoveUser(string user, string groupName) {
            _userService.RemoveUser(user, groupName);
            await Clients.All.SendAsync("ReceiveUsers", _userService.Users);
        }
        public async Task AddToGroup(string groupName) {
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
            await AddUser(Context.ConnectionId, groupName);
            await Clients.Group(groupName).SendAsync("ReceiveMessage", $"{Context.ConnectionId} has joined the group {groupName}.");
        }
        public async Task RemoveFromGroup(string groupName) {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
            await RemoveUser(Context.ConnectionId, groupName);
            await Clients.Group(groupName).SendAsync("ReceiveMessage", $"{Context.ConnectionId} has left the group {groupName}.");
        }
        public async Task GetUsersInGroup(string groupName) {
            await Clients.Group(groupName).SendAsync("ReceiveUsers", _userService.Users);
        }
    }
}