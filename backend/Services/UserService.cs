using System;

public interface IUserService 
{
    List<object> Users { get; }
    void AddUser(string user, string groupName);
    void RemoveUser(string user, string groupName);
}

public class UserService : IUserService 
{
    public List<object> Users { get; } = new List<object>();
    
    public void AddUser(string user, string groupName) {
        Users.Add(new { user, groupName });
    }
    public void RemoveUser(string user, string groupName) {
        Users.Remove(new { user, groupName });
    }
}