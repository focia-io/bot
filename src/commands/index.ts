import type { Command } from '@focia/bot'

import compare from './compare'

const commander = () => {
    const payload: Map<string, Command> = new Map()

    const instrcutions = [compare]

    for (const instruction of instrcutions) {
        payload.set(instruction.data.name, instruction)
    }

    return payload
}

export const commands = commander()
