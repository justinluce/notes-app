using System;

public class DocumentService
{
    private string _documentContent = "";

    public string GetContent() => _documentContent;

    public void UpdateContent(string newContent) {
        // Add logic for merging changes, conflict resolution, etc.
        _documentContent = newContent;
    }
}
