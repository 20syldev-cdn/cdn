import { ActivityType } from "discord.js";
import { env } from "../env.js";
export function onReady(client, logger) {
    logger.log({ method: "GET", url: "/ready", status: 200 });
    const serveur = client.guilds.cache.get(env.GUILD_ID);
    if (!serveur)
        return;
    const membres = serveur.memberCount;
    const slam = serveur.members.cache.filter((member) => member.roles.cache.has(env.ROLE_SLAM)).size;
    const sisr = serveur.members.cache.filter((member) => member.roles.cache.has(env.ROLE_SISR)).size;
    const activities = [
        { name: `${membres} élèves`, type: ActivityType.Watching },
        { name: "les suggestions", type: ActivityType.Listening },
        { name: `${slam} élèves en SLAM`, type: ActivityType.Watching },
        { name: "rien, ça travaille.", type: ActivityType.Playing },
        { name: `${sisr} élèves en SISR`, type: ActivityType.Watching },
        { name: "le cours", type: ActivityType.Listening },
    ];
    if (env.PRODUCTION === "true") {
        let i = 0;
        setInterval(() => {
            client.user.setActivity(activities[i]);
            i = (i + 1) % activities.length;
        }, 20000);
    }
    else {
        client.user.setActivity({
            name: "💻 En mode développement",
            type: ActivityType.Custom,
        });
    }
}
//# sourceMappingURL=ready.js.map