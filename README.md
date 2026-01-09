# Dexter 🤖

Dexter is an autonomous football betting tipster advisor that thinks, plans, and learns as it works. It performs analysis using task planning, self-reflection, and real-time match data. Think Claude Code, but built specifically for football betting insights.


<img width="979" height="651" alt="Screenshot 2025-10-14 at 6 12 35 PM" src="https://github.com/user-attachments/assets/5a2859d4-53cf-4638-998a-15cef3c98038" />

## Overview

Dexter takes complex football betting questions and turns them into clear, step-by-step research plans. It runs those tasks using live match data, checks its own work, and refines the results until it has a confident, data-backed recommendation.  

**Key Capabilities:**
- **Intelligent Task Planning**: Automatically decomposes complex betting questions into structured research steps
- **Autonomous Execution**: Selects and executes the right tools to gather match odds and form data
- **Self-Validation**: Checks its own work and iterates until tasks are complete
- **Real-Time Match Data**: Access to odds, fixtures, injuries, and team stats
- **Safety Features**: Built-in loop detection and step limits to prevent runaway execution

[![Twitter Follow](https://img.shields.io/twitter/follow/virattt?style=social)](https://twitter.com/virattt)

<img width="996" height="639" alt="Screenshot 2025-11-22 at 1 45 07 PM" src="https://github.com/user-attachments/assets/8915fd70-82c9-4775-bdf9-78d5baf28a8a" />


### Prerequisites

- [Bun](https://bun.com) runtime (v1.0 or higher)
- OpenAI API key (get [here](https://platform.openai.com/api-keys))
- API-Football API key (get [here](https://www.api-football.com/))
- Tavily API key (get [here](https://tavily.com)) - optional, for web search

#### Installing Bun

If you don't have Bun installed, you can install it using curl:

**macOS/Linux:**
```bash
curl -fsSL https://bun.com/install | bash
```

**Windows:**
```bash
powershell -c "irm bun.sh/install.ps1|iex"
```

After installation, restart your terminal and verify Bun is installed:
```bash
bun --version
```

### Installing Dexter

1. Clone the repository:
```bash
git clone https://github.com/virattt/dexter.git
cd dexter
```

2. Install dependencies with Bun:
```bash
bun install
```

3. Set up your environment variables:
```bash
# Copy the example environment file (from parent directory)
cp env.example .env

# Edit .env and add your API keys (if using cloud providers)
# OPENAI_API_KEY=your-openai-api-key
# ANTHROPIC_API_KEY=your-anthropic-api-key
# GOOGLE_API_KEY=your-google-api-key

# (Optional) If using Ollama locally
# OLLAMA_BASE_URL=http://127.0.0.1:11434

# Other required keys
# API_FOOTBALL_API_KEY=your-api-football-api-key
# TAVILY_API_KEY=your-tavily-api-key
```

### Usage

Run Dexter in interactive mode:
```bash
bun start
```

Or with watch mode for development:
```bash
bun dev
```

### Example Queries

Try asking Dexter questions like:
- "Arsenal vs Chelsea: best 1X2 pick and odds summary"
- "Find value in Over/Under 2.5 for Real Madrid vs Barcelona"
- "Premier League weekend matches with BTTS potential"
- "Any injury updates that affect the Tottenham vs Newcastle market?"

Dexter will automatically:
1. Break down your question into research tasks
2. Fetch the necessary odds, fixtures, and form data
3. Perform comparisons and market analysis
4. Provide a comprehensive, data-rich recommendation

## Architecture

Dexter uses a multi-agent architecture with specialized components:

- **Planning Agent**: Analyzes queries and creates structured task lists
- **Action Agent**: Selects appropriate tools and executes research steps
- **Validation Agent**: Verifies task completion and data sufficiency
- **Answer Agent**: Synthesizes findings into comprehensive responses

## Tech Stack

- **Runtime**: [Bun](https://bun.sh)
- **UI Framework**: [React](https://react.dev) + [Ink](https://github.com/vadimdemedes/ink) (terminal UI)
- **LLM Integration**: [LangChain.js](https://js.langchain.com) with multi-provider support (OpenAI, Anthropic, Google)
- **Schema Validation**: [Zod](https://zod.dev)
- **Language**: TypeScript


### Changing Models

Type `/model` in the CLI to switch between:
- GPT 4.1 (OpenAI)
- Claude Sonnet 4.5 (Anthropic)
- Gemini 3 (Google)

## How to Contribute

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

**Important**: Please keep your pull requests small and focused.  This will make it easier to review and merge.


## License

This project is licensed under the MIT License.
