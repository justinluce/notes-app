using System;

public interface IUserService 
{
    List<string> Users { get; }
    void AddUser(string user);
}

public class UserService : IUserService 
{
    public List<string> Users { get; } = new List<string>();

    public void AddUser(string user) {
        Users.Add(user);
    }
}