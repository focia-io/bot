import type { Event } from '@focia/bot'

import ready from './ready'

const listen = () => {
    return [ready]
}

export const events: Event[] = listen()
