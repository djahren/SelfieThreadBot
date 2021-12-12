# SelfieThreadBot

A Discord chat bot that creates a thread whenever an image is shared (in specified channels). The goal of SelfieThreadBot is to allow selfie (and other image sharing) channels to focus on the pictures, and have conversation beneath each picture - some what akin to many social media websites. SelfieThreadBot hopes to help create a dedicated space for people to comment on photos instead of feeling awkward about taking up space in the main selfies channel.

- [Installation](#installation)
- [Usage/Commands](#usagecommands)
- [Licence](#license)
- [Support](#support)

![SelfieThreadBot in a Discord server](https://raw.githubusercontent.com/djahren/SelfieThreadBot/master/docs/images/demo.jpg)

## Installation
Pre-requisites: You must have [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) already setup. It is reccomended to run chat bots on a dedicated (on 24/7) computer. You can get a free server from [Oracle Cloud](https://www.oracle.com/cloud/free/).
1. Download or git clone this repository. 
2. Setup a discord chat bot in the [Discord Developer Portal](https://discord.com/developers/applications)
    1. Create a new application and give it a name.
    2. Click on the Bot section and select Add Bot.
    3. Copy your token, and *add it to the downloaded auth.json file*, between the two quotes.
    4. Click on OAuth2 then URL Generator.
    5. Select `bot` and `applications.commands` under Scope. No bot permissions are needed.
    NOTE: SelfieThreadBot will allow access to admin commands for the highest role on your server. You may want check your roles before the next step to make sure the top role is an admininistrative only role. 
    7. Copy the link at the bottom of the page, paste it into a new window and add it to a Discord server you are an admin on. 
    8. The bot should appear in your server as offline. 
3. In a command prompt/terminal window navigate to the directory where you saved the bot.
4. Run `docker-compose up` to check if the bot is functioning properly. 
5. If all looks good, press `CTRL + C` on your keyboard twice, then once the bot has stopped, run `docker-compose up -d` to run the bot in detached mode (in the background).

## Usage/Commands
### How It Works
When SelfieThreadBot is added to a server, it assigns permission to run admin commands to the highest listed server role. An admin will need to assign which channel(s) the bot will create threads in. When a member posts a message to that thread with an attachment (picture, video, etc), SelfieThreadBot creates a thread under that message. Members can comment in the thread. 
### Admin Commands
- `/addselfiechannel #channel` will add a channel for SelfieThreadBot to create threads in.
- `/removeselfiechannel #channel` will remove a channel from SelfieThreadBot's watch list.
- `/setselfiethreadarchive <time>` will set the auto-archive time for all threads that SelfieThreadBot creates. Per Discord's policies, unboosted servers can set this value to 1 day or 1 hour, level 1 boost servers can set this to 3 days, and level 2+ servers can set this to 1 week.
### Everybody Commands
- `/listselfiechannels` will list all channels that SelfieThreadBot will automatically create threads in when media is shared.
### A Few Extra Notes
- If you'd like to add SelfieThreadBot to a channel that has custom permissions (that the @everyone role can't see/participate in) you need to give the SelfieThreadBot role specific access to view that channel.
- SelfieThreadBot can opperate on one or more Discord servers/guilds at once. 
- If SelfieThreadBot is kicked from a server any watched channels will be removed as well as thread archive settings.
## Bug Reports
For any issues or bug reports, please log them in the [Issue Tracker on GitHub](https://github.com/djahren/SelfieThreadBot/issues)

## License
Copyright 2021 Ahren Bader-Jarvis

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

## Support
If this project helps you out at all, please consider supporting me on Ko-Fi.

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/ahren)

