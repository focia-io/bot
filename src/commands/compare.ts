import { ApplicationCommandOptionType, EmbedBuilder } from 'discord.js'
import { Events, Plans, Routes } from '@focia/constant'
import { round, generateAsciiLoadingBar } from '@focia/utils'

import type { Command } from '@focia/bot'

export default {
    data: {
        name: 'compare',
        description: 'compare!',

        options: [
            {
                name: 'thumbnail-one',
                description: 'Your YouTube thumbnail',
                type: ApplicationCommandOptionType.Attachment,
                required: true,
            },

            {
                name: 'thumbnail-two',
                description: 'Your YouTube thumbnail',
                type: ApplicationCommandOptionType.Attachment,
                required: true,
            },

            {
                name: 'thumbnail-three',
                description: 'Your YouTube thumbnail',
                type: ApplicationCommandOptionType.Attachment,
                required: false,
            },

          
        ],
    },

    async execute(interaction, database, logger, inference, context) {
        const embeddings: EmbedBuilder[] = []

        const urls = interaction.options.data
            .map((option) => {
                if (
                    option.attachment &&
                    option.attachment.contentType &&
                    ['image/jpeg', 'image/png', 'image/webp'].includes(option.attachment.contentType)
                ) {
                    return option.attachment.url
                }
                return ''
            })
            .filter((url) => url !== '')


        await interaction.deferReply({ ephemeral: false })

        const results = await inference.compare(urls)

        for (let index = 0; index < results.length; index++) {
            const embed = new EmbedBuilder().setURL(Routes.landing.base).setImage(results[index].url)

            embed.setTitle('Your Comparison')

            embed.setAuthor({
                name: context.author,
                iconURL: interaction.user.avatarURL() ?? '',
            })
            
            embed.setFields(
                results.map((result, index) => {
                    const percentage = round(result.score * 100, 3)

                    return {
                        name: `Thumbnail #${index + 1}`,
                        value: `Engagement Score:\n ${generateAsciiLoadingBar(percentage, 10)} ${percentage}%`,
                        inline: true,
                    }
                }),
            )
            embed.setTimestamp()

            embed.setFooter({
                text: context.footer,
                iconURL: 'https://framerusercontent.com/images/RUSjBD0rQ9RcM7zMX8oc6R9reEo.webp',
            })

            embeddings.push(embed)
        }

        await database.usage.insert({
            event: Events.Command,
            message: '@focia/bot/blaze successfully proccessed the command',
            cost: context.cost,
            creator: context.user.id,
            task: null,
        })


        await interaction.editReply({ embeds: embeddings, content: ' ' })
    },
} satisfies Command
