# n8n Cheat Sheet

> **More Information:** Follow [@data.popcorn](https://linktr.ee/datapopcorn)  
> **License:** © Data Popcorn. CC BY 4.0 | v2025.04

## Table of Contents

1. [Getting Started with Triggers](#getting-started-with-triggers)
2. [Data Transfer](#data-transfer)
3. [Expressions](#expressions)
4. [Built-in Nodes](#built-in-nodes)
5. [Docker Self-hosting](#docker-self-hosting)
6. [AI Agent](#ai-agent)
7. [HTTP Request (API)](#http-request-api)
8. [Keyboard Shortcuts](#keyboard-shortcuts)
9. [Node Common Settings](#node-common-settings)
10. [Community & Resources](#community--resources)

---

## Getting Started with Triggers

### Node Structure
**Node Flow:** Input > Function > Output

### Trigger Node (Start)
The trigger node is the starting point of any n8n workflow. It defines when and how the workflow should be executed.

---

## Data Transfer

### 1. Items Count
- Controls how many data items are processed through the workflow
- Each node can handle single or multiple items

### 2. Data Type
- **JSON objects** - Primary data format
- **Arrays** - For handling multiple items
- **Strings, Numbers, Booleans** - Basic data types

---

## Expressions

### Types and Usage

| Type | Description | Example |
|------|-------------|---------|
| **Basic** | Simple data access | `{{ $json["key"] }}` |
| **Node nomination** | Access data from specific nodes | `{{ $node["nodeName"].json["value"] }}` |
| **Date formatting** | Format dates and times | `{{ $now.format('yyyy-MM-dd') }}` |
| **Condition** | Boolean expressions | `{{ $json["price"] > 100 }}` |
| **Ternary operator** | Conditional values | `{{ $json["price"] > 100 ? "expensive" : "cheap" }}` |

### Built-in Methods
- `$jmespath()` - JSON path queries
- `$fromAI()` - AI-generated content
- `$max()`, `$min()` - Mathematical operations

### Global Variables
- `$execution` - Current execution info
- `$itemIndex` - Current item index
- `$input` - Input data
- `$parameter` - Node parameters
- `$prevNode` - Previous node data
- `$runindex` - Run index
- `$today` - Current date
- `$vars` - Workflow variables
- `$workflow` - Workflow metadata
- `$nodeVersion` - Node version
- `$now` - Current timestamp

### Documentation
For comprehensive expression documentation: [n8n Data Transformation Functions](https://docs.n8n.io/code/builtin/data-transformation-functions/)

---

## Built-in Nodes

### Trigger Nodes

| Node | Description |
|------|-------------|
| **Manual** | A trigger that can be executed by the user manually |
| **Schedule** | Executes workflow at specified time intervals |
| **Form** | Uses form data submitted by the user as a trigger |
| **Chat** | Triggers based on chat input or messages |
| **Webhook** | External system sends an HTTP request to trigger the workflow |
| **Workflow** | Executed when called from other workflows |

### Core Nodes

| Node | Description |
|------|-------------|
| **Edit Fields (Set)** | Can set or modify field values |
| **Remove Duplicate** | Removes duplicated data |
| **IF** | Branches flow using conditions |
| **Aggregate** | Groups multiple data and summarizes |
| **Split out** | Split the set into individual elements |
| **Filter** | Filters only data that meets conditions |
| **Summarize** | Summarizes data counts, averages, etc. |
| **Code** | Can process data with JavaScript code |
| **Merge** | Combines two data streams |
| **Sort** | Sorts data by specified criteria |
| **Limit** | Limits the amount of data to output |
| **Loop** | Executes nodes repeatedly |
| **Wait** | Waits for a specified time period |
| **Convert to File** | Converts data to file format |
| **Extract from File** | Extracts data from files |
| **Compression** | Performs file compression or decompression |
| **Stop and Error** | Stops the workflow or generates errors |
| **HTTP Request** | Sends HTTP requests to external APIs |

---

## Docker Self-hosting

### Installation Commands

```bash
# Clone the self-hosted AI starter kit
git clone https://github.com/n8n-io/self-hosted-ai-starter-kit.git
cd self-hosted-ai-starter-kit

# Update to latest version
sudo docker pull docker.n8n.io/n8nio/n8n

# Stop existing container
sudo docker stop n8n

# Remove existing container
sudo docker rm n8n
```

### Docker Run Configuration

```bash
sudo docker run -it \
  --restart unless-stopped \
  --name n8n \
  -p 5678:5678 \
  -v n8n_data:/home/node/.n8n \
  -e WEBHOOK_URL="https://n8n.example.com/" \
  -e N8N_SMTP_HOST="smtp.gmail.com" \
  -e N8N_SMTP_PORT=465 \
  -e N8N_SMTP_USER="YOUR_EMAIL" \
  -e N8N_SMTP_PASS="wcmj yyyl uwuc syyf" \
  -e N8N_SMTP_SENDER="YOUR_EMAIL" \
  -e N8N_SMTP_SECURE="true" \
  -e N8N_SMTP_SSL="true" \
  -e GENERIC_TIMEZONE="Asia/Seoul" \
  -e N8N_DIAGNOSTICS_ENABLED=false \
  -e N8N_VERSION_NOTIFICATIONS_ENABLED=false \
  -e VUE_APP_URL_BASE_API=https://n8n.example.com/ \
  -e N8N_ENCRYPTION_KEY=<SOME_RANDOM_STRING> \
  -e N8N_TEMPLATES_ENABLED="false" \
  -e N8N_USER_FOLDER=/home/jim/n8n \
  -e EXECUTIONS_TIMEOUT=3600 \
  -e EXECUTIONS_TIMEOUT_MAX=7200 \
  -e N8N_METRICS=true \
  -e N8N_CUSTOM_EXTENSIONS="/home/jim/n8n/custom-nodes;/data/n8n/nodes" \
  -e NODE_FUNCTION_ALLOW_BUILTIN=* \
  -d docker.n8n.io/n8nio/n8n:latest
```

### Environment Variables Explained

| Variable | Description |
|----------|-------------|
| `WEBHOOK_URL` | Public webhook URL |
| `N8N_SMTP_*` | SMTP configuration for email |
| `GENERIC_TIMEZONE` | Set timezone |
| `N8N_DIAGNOSTICS_ENABLED` | Disable diagnostics |
| `N8N_VERSION_NOTIFICATIONS_ENABLED` | Disable version check |
| `VUE_APP_URL_BASE_API` | Frontend base API URL |
| `N8N_ENCRYPTION_KEY` | Encryption key for sensitive data |
| `N8N_TEMPLATES_ENABLED` | Enable/disable templates |
| `N8N_USER_FOLDER` | User folder path |
| `EXECUTIONS_TIMEOUT` | Execution timeout (seconds) |
| `EXECUTIONS_TIMEOUT_MAX` | Max execution time (seconds) |
| `N8N_METRICS` | Enable Prometheus metrics |
| `N8N_CUSTOM_EXTENSIONS` | Custom nodes path |
| `NODE_FUNCTION_ALLOW_BUILTIN` | Allow built-in modules |

---

## AI Agent

### Components Structure

```
AI Agent
├── AI model (*required) (1:1)
├── Memory (1:N)
└── Tool (1:N)
```

### Configuration Elements

- **Persona**: Defines the AI's behavior or role
- **Task**: Todo items and objectives
- **Context**: Objective and background information
- **Format**: Output format specifications

### Input Processing
- Processes user's input or requests
- Integrates with workflow data and context

---

## HTTP Request (API)

### Features
- **One Click - Auto fill**: Automatically populate common request fields
- **Import URL component**: Parse and import URL components
- **HTTP Request**: Send requests to external APIs and services

### Common Use Cases
- API integrations
- Data fetching from external services
- Webhook sending
- Authentication flows

---

## Keyboard Shortcuts

### Workflow Control

| Shortcut | Action |
|----------|--------|
| `Ctrl + Alt + N` | Create New Workflow |
| `Ctrl + O` | Open Workflow |
| `Ctrl + S` | Save Current Workflow |
| `Ctrl + Z` | Undo |
| `Ctrl + Shift + Z` | Redo |
| `Ctrl + Enter` | Run Workflow |

### Canvas Navigation

| Shortcut | Action |
|----------|--------|
| `Ctrl + Left Mouse + Drag` | Move Node View |
| `Ctrl + Middle Mouse + Drag` | Move Node View |
| `Space + Drag` | Move Node View |
| `Middle Mouse + Drag` | Move Node View |
| `Two Fingers on Touchscreen` | Move Node View |

### Canvas Zoom

| Shortcut | Action |
|----------|--------|
| `=+` or `=` | Zoom In |
| `-` or `_` | Zoom Out |
| `0` | Reset Zoom |
| `1` | Fit Workflow to View |
| `Ctrl + Mouse Wheel` | Zoom In/Out |

### Canvas Nodes

| Shortcut | Action |
|----------|--------|
| `Ctrl + A` | Select All Nodes |
| `Ctrl + V` | Paste Node |
| `Shift + S` | Add Note |
| `↓` | Select Node Below |
| `←` | Select Node to the Left |
| `→` | Select Node to the Right |
| `↑` | Select Node Above |

### When Node is Selected

| Shortcut | Action |
|----------|--------|
| `Ctrl + C` | Copy |
| `Ctrl + X` | Cut |
| `D` | Disable |
| `Delete` | Delete |
| `Enter` | Open |
| `F2` | Rename |
| `P` | Pin Data |
| `Shift + ←` | Select All Left-side Nodes |
| `Shift + →` | Select All Right-side Nodes |

### Node Panel

| Shortcut | Action |
|----------|--------|
| `Tab` | Open Node Panel |
| `Enter` | Insert Node |
| `Escape` | Close Node Panel |
| `Enter` | Insert / Expand Node |

### Node Panel Category

| Shortcut | Action |
|----------|--------|
| `→` | Expand Category |
| `←` | Collapse Category |

### Inside Node

| Shortcut | Action |
|----------|--------|
| `=` | Toggle Expression Mode |

---

## Node Common Settings

### Node Version Check
- **Category**: Node version management
- **Node Settings**: Version control and updates

### Error Handling Options

| Setting | Description |
|---------|-------------|
| **Always Output Data** | Returns an empty item even when there's no data. Be careful as this may cause infinite loops with IF nodes |
| **Execute Once** | Processes only the first item and ignores the rest |
| **Retry On Fail** | Retries until successful upon failure |
| **On Error: Stop Workflow** | Stops the entire workflow when an error occurs |
| **On Error: Continue** | Continues to the next node even if there's an error, using the last valid data |
| **On Error: Continue (using error output)** | Passes the error info to the next node and continues the workflow |

### Node Notes

| Setting | Description |
|---------|-------------|
| **Notes** | Allows you to add a memo to the node |
| **Display note in flow** | When enabled, displays the memo like a subtitle inside the workflow |

---

## Community & Resources

The n8n community is active and growing. Check out:

### Official Resources
- **Official Docs**: [docs.n8n.io](https://docs.n8n.io)
- **Community Forum**: [community.n8n.io](https://community.n8n.io)
- **Discord Chat**: [discord.gg/n8n](https://discord.gg/n8n)
- **GitHub**: [n8n-io/n8n](https://github.com/n8n-io/n8n) (Issues, PRs, source code)

### Credits
Thanks to u/MixConception for contributions to this cheat sheet.

---

*This cheat sheet provides a comprehensive overview of n8n's core features and functionality. For the most up-to-date information, always refer to the official n8n documentation.*

