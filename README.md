# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/3e782f87-1c07-44ea-abe6-4de2dddff3a7

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/3e782f87-1c07-44ea-abe6-4de2dddff3a7) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## Running the Telegram Bot

This project also includes a Telegram bot located in the `telegram_location_bot` directory. To set up and run the bot:

### Prerequisites
- Python 3.x installed
- A Telegram bot token from [@BotFather](https://t.me/BotFather)

### Setup Steps

```sh
# Step 1: Navigate to the bot directory
cd telegram_location_bot

# Step 2: Install Python dependencies
pip install -r requirements.txt

# Step 3: Configure the bot
# Edit the .env file and replace YOUR_BOT_TOKEN_HERE with your actual bot token
# You can get a bot token by messaging @BotFather on Telegram

# Step 4: Run the bot
python3 app.py
```

### Bot Configuration

The bot uses environment variables for configuration. Edit the `.env` file in the `telegram_location_bot` directory:

- `BOT_TOKEN`: Your Telegram bot token (required)
- `SECRET_KEY`: Flask secret key for sessions
- `DATABASE_URL`: Database connection string (defaults to SQLite)
- `ADMIN_USERNAME`: Admin username for the web interface
- `ADMIN_PASSWORD`: Admin password for the web interface

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/3e782f87-1c07-44ea-abe6-4de2dddff3a7) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
