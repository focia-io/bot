import { initialise } from '@focia/initialise'
initialise()

import { Client, GatewayIntentBits, REST } from 'discord.js'
import { API } from '@discordjs/core/http-only'

import { Database } from '@focia/database'
import { Logger } from '@focia/logger'
import { config, pluralise } from '@focia/utils'

import { Inference } from './inference'

import { events } from './events'
import { commands } from './commands'
import { middleware } from './middleware'

async function bot(): Promise<void> {
    const {
        INSTANCE_ID,
        GRAFANA_URL,
        GRAFANA_API_KEY,
        ENVIRONMENT,
        DISCORD_BOT_ID,
        DISCORD_BOT_TOKEN,
        DISCORD_BOT_BLAZE_API_ENDPOINT,
        DISCORD_BOT_BLAZE_API_TOKEN,
        SUPABASE_URL,
        SUPABASE_SERVICE_KEY,
    } = config()

    const logger = new Logger('bot', INSTANCE_ID, GRAFANA_URL, GRAFANA_API_KEY, ENVIRONMENT)

    const database = new Database(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    await logger.info(`Successfully connected to the database.`)

    const client = new Client({ intents: [GatewayIntentBits.Guilds], shards: 'auto' })

    const inference = new Inference(DISCORD_BOT_BLAZE_API_ENDPOINT, DISCORD_BOT_BLAZE_API_TOKEN)

    const rest = new REST({ version: '10' }).setToken(DISCORD_BOT_TOKEN)
    const api = new API(rest)

    const result = await api.applicationCommands.bulkOverwriteGlobalCommands(
        DISCORD_BOT_ID,
        [...commands.values()].map((command) => command.data),
    )

    await logger.info(`Successfully synced ${result.length} ${pluralise(result.length, 'command', 'commands')}.`)

    middleware(commands, events, client, database, logger, inference)

    await logger.info(`Successfully configured events and commands.`)

    client.login(DISCORD_BOT_TOKEN)

    await logger.info(`Bot is ready.`)
}

void bot()
