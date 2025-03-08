using Microsoft.AspNetCore.SignalR;

namespace SignalRChat.Hubs
{
    public class ChatHub : Hub
    {
        private readonly DocumentService _documentService;

        public ChatHub(DocumentService documentService) {
            _documentService = documentService;
        }
        public async Task UpdateDocument(string user, string newContent) {
            _documentService.UpdateContent(newContent);
            System.Console.WriteLine(newContent);
            await Clients.All.SendAsync("ReceiveDocumentUpdate", _documentService.GetContent());
        }
        public async Task SendMessage(string user, string message) {
            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }
    }
}