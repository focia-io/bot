import { Events } from 'discord.js'
import type { Event } from '@focia/bot'

export default {
    name: Events.ClientReady,
    once: true,
    async execute(client) {},
} satisfies Event<Events.ClientReady>
