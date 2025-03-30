# TaskBoard for VS Code

A Visual Studio Code extension that provides a simple, efficient Kanban board for managing tasks directly within your editor. Perfect for developers who want to track their tasks without leaving VS Code.

## Features

### 🎯 Task Management
- Create, edit, and organize tasks in a Kanban-style board
- Smooth drag-and-drop functionality with visual feedback
- Reorder tickets within columns
- Move tickets between columns
- Quick status updates via drag-and-drop
- Automatic timestamp tracking for task creation and updates

### 📋 Board Organization
- Three-column layout:
  - To Do
  - In Progress
  - Done
- Clean, VS Code-native interface
- Persistent board state and ticket order
- Visual drop previews when moving tickets

### 💾 Data Storage
- Support for both JSON and CSV file formats
- Auto-save functionality
- File watching for real-time updates
- Proper handling of special characters and formatting

### 🎨 User Experience
- Smooth animations and transitions
- Clear visual feedback during drag operations
- Drop previews for better positioning
- Responsive layout that adapts to your window size
- Native VS Code theming support

## Getting Started

1. Open the Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`)
2. Type "TaskBoard" to see available commands:
   - `TaskBoard: Create New Board` - Create a new board file
   - `TaskBoard: Open Board` - Open an existing board
   - `TaskBoard: Show Current Board` - Display the active board

## Using TaskBoard

### Creating a New Board
1. Open Command Palette
2. Select `TaskBoard: Create New Board`
3. Choose file format (JSON or CSV)
4. Select save location

### Managing Tasks
- **Create Task**: Click "Add" in any column
- **Edit Task**: Click on the task title or description
- **Move Task**: 
  - Drag and drop between or within columns
  - Visual preview shows where the task will be placed
- **Delete Task**: Click the delete button on the task

### Auto-save
All changes are automatically saved to your board file. No manual saving required!

## File Formats

### JSON Format
```json
{
  "columns": [
    {
      "id": "todo",
      "name": "To Do",
      "tickets": [
        {
          "id": "ticket-1",
          "title": "Example Task",
          "description": "Task description",
          "status": "todo",
          "createdAt": "2024-03-26T16:00:00.000Z",
          "updatedAt": "2024-03-26T16:00:00.000Z",
          "position": 1000
        }
      ]
    }
  ]
}
```

### CSV Format
The CSV format includes all task fields in a flat structure:
```csv
id,title,description,status,createdAt,updatedAt,position
ticket-1,Example Task,Task description,todo,2024-03-26T16:00:00.000Z,2024-03-26T16:00:00.000Z,1000
```

## Requirements

- Visual Studio Code version 1.87.0 or higher
- Node.js and npm (for development)

## Development

### Setup
```bash
git clone https://github.com/siupangjau/taskboard_vsc_extension.git
cd taskboard
npm install
```

### Build
```bash
npm run compile
```

### Debug
1. Open in VS Code
2. Press F5 to start debugging
3. Use Command Palette to test commands

## Contributing

Found a bug or have a feature request? Please open an issue on our [GitHub repository](https://github.com/siupangjau/taskboard_vsc_extension).

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with React and TypeScript
- Uses react-beautiful-dnd for drag-and-drop functionality
- Inspired by Kanban methodology
