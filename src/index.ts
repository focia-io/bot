export * from './bot'
import type { Logger } from '@focia/logger'
import type { Database } from '@focia/database'
import type { Subscription, Plan } from '@focia/schema'
import type { Inference } from './inference'

import type { RESTPostAPIApplicationCommandsJSONBody, CommandInteraction, ClientEvents } from 'discord.js'

export type BaseStructure<T> = (structure: unknown) => structure is T

export type Context = {
    user: {
        id: string
    }

    subscription: Omit<Subscription, 'plan'>
    plan: Plan
    usage: number
    cost: number
    author: string
    footer: string
}

export type Command = {
    /**
     * The data for the command
     */
    data: RESTPostAPIApplicationCommandsJSONBody
    /**
     * The function to execute when the command is called
     *
     * @param interaction - The interaction of the command
     */
    execute(interaction: CommandInteraction, database: Database, logger: Logger, inference: Inference, context: Context): Promise<void> | void
}

export type Event<T extends keyof ClientEvents = keyof ClientEvents> = {
    /**
     * The function to execute when the event is emitted.
     *
     * @param parameters - The parameters of the event
     */
    execute(...parameters: ClientEvents[T]): Promise<void> | void
    /**
     * The name of the event to listen to
     */
    name: T
    /**
     * Whether or not the event should only be listened to once
     *
     * @defaultValue false
     */
    once?: boolean
}
