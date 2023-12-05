import { Events, type Client } from "discord.js";
import type { Command, Event } from "@focia/bot";

import type { Database } from "@focia/database";
import type { Logger } from "@focia/logger";

import type { Inference } from "../inference";

export const middleware = (
  commands: Map<string, Command>,
  events: Event[],
  client: Client,
  database: Database,
  logger: Logger,
  inference: Inference
) => {
  const interactionCreateEvent: Event<Events.InteractionCreate> = {
    name: Events.InteractionCreate,
    async execute(interaction) {
      if (interaction.isCommand()) {
        const command = commands.get(interaction.commandName);

        if (!command) {
          logger.error(`Command '${interaction.commandName}' not found.`);
          return;
        }

        const { id } = await database.identity.discord(interaction.user.id);

        if (!id) {
          await interaction.reply({
            content: `It seems you're account is not connected to Focia. You can sign up at: https://app.focia.io/auth/login`,
          });
          return;
        }

        const user = await database.profile.get("creator", id);

        if (user.error) {
          await interaction.reply({
            content: `It seems you're account is not connected to Focia. You can sign up at: https://app.focia.io/auth/login`,
          });
          return;
        }

        const subscription = await database.subscription.get("user", id);

        if (subscription.error) {
          await interaction.reply({
            content: `It seems you're account is not connected to Focia. You can sign up at: https://app.focia.io/auth/login`,
          });
          return;
        }

        const usage = await database.usage.total(id);

        if (usage.error) {
          await interaction.reply({
            content: `It seems you're account is not connected to Focia. You can sign up at: https://app.focia.io/auth/login`,
          });
          return;
        }

        const cost = 25;

        const context = {
          plan: subscription.data.plan,
          subscription: subscription.data,

          author: `Created by ${
            interaction.user.displayName
          } (${subscription.data.plan.name.toLocaleUpperCase()})`,

          footer: `${(usage.data - cost).toLocaleString()} / ${
            subscription.data.plan.credits >= 1_024_000
              ? "∞"
              : subscription.data.plan.credits.toLocaleString()
          } credits remaining. Your credits reset on ${new Date(
            subscription.data.endingAt ?? ""
          ).toLocaleDateString()}.\n${cost} credits used for this ranking`,

          user: {
            id,
          },

          usage: usage.data,
          cost,
        };

        if (context.usage + context.cost > context.plan.credits) {
          await interaction.reply({
            content: `You have exceeded your plan's credits. You can upgrade your plan at: https://app.focia.io/settings`,
          });
          return;
        }

        await command.execute(
          interaction,
          database,
          logger,
          inference,
          context
        );
      }
    },
  };

  for (const event of [...events, interactionCreateEvent]) {
    if (event.name === Events.ClientReady) {
      logger.info(`Configuring events and commands.`);
    }

    client[event.once ? "once" : "on"](event.name, async (...args) =>
      event.execute(...args)
    );
  }
};
