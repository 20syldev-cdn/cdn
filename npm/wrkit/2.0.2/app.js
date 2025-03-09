import dotenv from 'dotenv';
import express from 'express';
import pkg from 'discord.js';
import { createServer } from 'https';
const { ActivityType, Client, GatewayIntentBits, GuildScheduledEventEntityType, Partials, REST, Routes } = pkg;

// Client Discord
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildPresences
    ],
    partials: [Partials.Channel]
});

// Express
dotenv.config();
const app = express();
const port = process.env.PORT || 4000;
const server = process.env.SERVER || 8080;

app.listen(port, () => console.log(`Serveur défini avec le port ${port}`));

// Serveur Web HTTPS
createServer((req, res) => {
    res.write('Bot en ligne');
    res.end();
}).listen(server, () => console.log(`Serveur HTTPS en ligne sur le port ${server}`));

// Configuration des commandes slash
const commands = [
    {
        name: 'class',
        description: 'Afficher le planning de la classe',
        options: [
            {
                type: 3,
                name: 'speciality',
                description: 'Spécialité de la classe (SLAM ou SISR)',
                required: true,
                choices: [
                    { name: 'SLAM', value: 'SLAM' },
                    { name: 'SISR', value: 'SISR' }
                ]
            }
        ],
    },
    {
        name: 'event-add',
        description: 'Ajouter un événement Discord',
        options: [
            {
                type: 3,
                name: 'nom',
                description: "Nom de l'événement",
                required: true
            },
            {
                type: 3,
                name: 'lieu',
                description: "Lieu de l'événement",
                required: true
            },
            {
                type: 4,
                name: 'jour',
                description: "Jour de l'événement (1-31)",
                required: true
            },
            {
                type: 4,
                name: 'mois',
                description: "Mois de l'événement (1-12)",
                required: true
            },
            {
                type: 4,
                name: 'année',
                description: "Année de l'événement",
                required: true
            },
            {
                type: 4,
                name: 'heure',
                description: "Heure de l'événement (0-23)",
                required: true
            },
            {
                type: 4,
                name: 'minute',
                description: "Minutes de l'événement (0-59)",
                required: true
            },
            {
                type: 4,
                name: 'durée',
                description: "Durée de l'événement en minutes",
                required: false
            },
            {
                type: 3,
                name: 'description',
                description: "Description de l'événement",
                required: false
            }
        ]
    },
    {
        name: 'event-edit',
        description: 'Modifier un événement Discord',
        options: [
            {
                type: 3,
                name: 'id',
                description: "ID de l'événement à modifier",
                required: true
            },
            {
                type: 3,
                name: 'nom',
                description: "Nom de l'événement",
                required: false
            },
            {
                type: 3,
                name: 'lieu',
                description: "Lieu de l'événement",
                required: false
            },
            {
                type: 4,
                name: 'jour',
                description: "Jour de l'événement (1-31)",
                required: false
            },
            {
                type: 4,
                name: 'mois',
                description: "Mois de l'événement (1-12)",
                required: false
            },
            {
                type: 4,
                name: 'année',
                description: "Année de l'événement",
                required: false
            },
            {
                type: 4,
                name: 'heure',
                description: "Heure de l'événement (0-23)",
                required: false
            },
            {
                type: 4,
                name: 'minute',
                description: "Minutes de l'événement (0-59)",
                required: false
            },
            {
                type: 4,
                name: 'durée',
                description: "Durée de l'événement en minutes",
                required: false
            },
            {
                type: 3,
                name: 'description',
                description: "Description de l'événement",
                required: false
            }
        ]
    },
    {
        name: 'event-delete',
        description: 'Supprimer un événement Discord',
        options: [
            {
                type: 3,
                name: 'id',
                description: "ID de l'événement à supprimer",
                required: true
            }
        ]
    }
];

// Configuration de l'API REST Discord
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

// Enregistrement des commandes
(async () => {
    try {
        console.log('Début de la mise à jour des commandes (/) de l\'application.');
        await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands });
        console.log('Les commandes (/) de l\'application ont été mises à jour avec succès.');
    } catch (error) {
        console.error(error);
    }
})();


// Statut du bot & calcul des membres
client.on('ready', (x) => {
    console.log(`✅ ${x.user.tag} en ligne !`);
    const server = client.guilds.cache.get(process.env.GUILD_ID);
    const members = server.memberCount;
    const slam = server.members.cache.filter(member => member.roles.cache.has(process.env.ROLE_SLAM)).size;
    const sisr = server.members.cache.filter(member => member.roles.cache.has(process.env.ROLE_SISR)).size;
    
    const activities = [
        {
            name: `${members} élèves`,
            type: ActivityType.Watching
        },
        { 
            name: 'les suggestions',
            type: ActivityType.Listening
        },
        { 
            name: `${slam} élèves en SLAM`,
            type: ActivityType.Watching
        },
        { 
            name: 'rien, ça travaille.',
            type: ActivityType.Playing
        },
        { 
            name: `${sisr} élèves en SISR`,
            type: ActivityType.Watching
        },
        { 
            name: 'le cours',
            type: ActivityType.Listening
        },
    ];

    let activityIndex = 0;
    setInterval(() => {
        client.user.setActivity(activities[activityIndex]);
        activityIndex = (activityIndex + 1) % activities.length;
    }, 20000);
});

// Afficher le planning
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName, options } = interaction;

    if (commandName === 'class') {
        const speciality = options.getString('speciality');
        let url = process.env.PLANNING_SLAM;

        if (speciality === 'SLAM') url = encodeURIComponent(process.env.PLANNING_SLAM);
        else if (speciality === 'SISR') url = encodeURIComponent(process.env.PLANNING_SISR);

        try {
            const response = await fetch('https://api.sylvain.pro/v3/hyperplanning', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `url=${url}&detail=full`
            });
            const data = await response.json();

            if (!data?.length) return interaction.reply({ content: 'Aucune données disponibles.', flags: 64 });

            const firstWeek = Object.values(data.reduce((acc, event) => {
                const week = Math.ceil((new Date(event.start) - new Date(new Date(event.start).getFullYear(), 0, 1)) / 604800000);
                acc[week] = acc[week] || []; acc[week].push(event);
                return acc;
            }, {}))[0];

            const eventsList = firstWeek.map(event => {
                let details = `**${event.subject}**\n`;
                if (event.teacher) details += `Professeur : ${event.teacher}\n`;
                if (event.classes?.filter(c => c.trim()).length) details += `Classes : ${event.classes.join(', ')}\n`;

                const start = new Date(event.start);
                const end = new Date(event.end);

                return `${details}De : <t:${Math.floor(start.getTime() / 1000)}:t> à <t:${Math.floor(end.getTime() / 1000)}:t>\n`;
            }).join('\n');

            await interaction.reply({
                embeds: [{
                    color: 0xa674cc,
                    title: `Planning de la spécialité ${speciality}`,
                    description: 'Voici le planning de cette semaine :',
                    fields: [{ name: 'Événements', value: eventsList }]
                }],
                flags: 64
            });
        } catch (error) {
            console.error('Erreur :', error);
            await interaction.reply({ content: 'Une erreur est survenue lors de la récupération du planning.', flags: 64 });
        }
    }
});

// Ajouter un événement
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName, options } = interaction;

    if (commandName === 'event-add') {
        const nom = options.getString('nom');
        const lieu = options.getString('lieu');
        const jour = options.getInteger('jour');
        const mois = options.getInteger('mois');
        const annee = options.getInteger('année');
        const heure = options.getInteger('heure');
        const minute = options.getInteger('minute');
        const duree = options.getInteger('durée');
        const description = options.getString('description');

        const startDate = new Date(annee, mois - 1, jour, heure, minute);
        const endDate = new Date(startDate.getTime() + (duree || 120) * 60 * 1000);

        if (startDate < new Date()) return await interaction.reply({ content: 'La date de début de l\'événement ne peut pas être dans le passé.', flags: 64 });

        const data = {
            name: nom,
            description,
            scheduledStartTime: startDate.toISOString(),
            scheduledEndTime: endDate.toISOString(),
            entityType: GuildScheduledEventEntityType.External,
            entityMetadata: {
                location: lieu
            },
            privacyLevel: 2
        };

        try {
            await interaction.guild.scheduledEvents.create(data);
            await interaction.reply({ content: `Événement ajouté : **${nom}** à **${lieu}** le **${startDate.toLocaleDateString('fr-FR')}** à **${startDate.toLocaleTimeString('fr-FR')}**.`, flags: 64 });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Une erreur est survenue lors de l\'ajout de l\'événement.', flags: 64 });
        }
    }
});

// Modifier un événement
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName, options } = interaction;

    if (commandName === 'event-edit') {
        const id = options.getString('id');
        const nom = options.getString('nom');
        const lieu = options.getString('lieu');
        const jour = options.getInteger('jour');
        const mois = options.getInteger('mois');
        const annee = options.getInteger('année');
        const heure = options.getInteger('heure');
        const minute = options.getInteger('minute');
        const duree = options.getInteger('durée');
        const description = options.getString('description');

        const event = await interaction.guild.scheduledEvents.fetch(id);
        if (!event) return await interaction.reply({ content: 'Événement non trouvé.', flags: 64 });

        const startDate = new Date(annee, mois - 1, jour, heure, minute);
        const endDate = new Date(startDate.getTime() + (duree || 120) * 60 * 1000);

        const data = {
            name: nom || event.name,
            description: description || event.description,
            scheduledStartTime: startDate.toISOString(),
            scheduledEndTime: endDate.toISOString(),
            entityMetadata: {
                location: lieu || event.entityMetadata.location
            }
        };

        try {
            await event.edit(data);
            await interaction.reply({ content: `Événement **${id}** modifié.`, flags: 64 });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Une erreur est survenue lors de la modification de l\'événement.', flags: 64 });
        }
    }
});

// Supprimer un événement
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName, options } = interaction;

    if (commandName === 'event-delete') {
        const id = options.getString('id');
        const event = await interaction.guild.scheduledEvents.fetch(id);
        if (!event) return await interaction.reply({ content: 'Événement non trouvé.', flags: 64 });

        try {
            await event.delete();
            await interaction.reply({ content: `Événement **${id}** supprimé.`, flags: 64 });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Une erreur est survenue lors de la suppression de l\'événement.', flags: 64 });
        }
    }
});


// Connexion à Discord
client.login(process.env.TOKEN);