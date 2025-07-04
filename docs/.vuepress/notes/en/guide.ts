import type { ThemeNote } from 'vuepress-theme-plume'
import { defineNoteConfig } from 'vuepress-theme-plume'

export const Guide: ThemeNote = defineNoteConfig({
    dir: 'guide',
    link: '/guide/',
    sidebar: [
        {
            text: 'Basic Info',
            collapsed: false,
            icon: 'carbon:idea',
            prefix: 'basicinfo',
            items: [
                'intro',
                'framework',
            ],
        },
        {
            text: 'Start with Dataflow',
            collapsed: false,
            icon: 'carbon:idea',
            prefix: 'quickstart',
            items: [
                'install',
                'quickstart'
            ],
        },
        {
            text: "Pipelines",
            collapsed: false,
            icon: 'carbon:flow',
            prefix: 'pipelines',
            items: [
                "TextPipeline",
                "ReasoningPipeline",
                "Text2SqlPipeline",
                "AgenticRAGPipeline"
            ]
        },
        {
            text: "General Operators",
            collapsed: false,
            icon: 'material-symbols:analytics-outline',
            prefix: 'general_operators',
            items: [
                "text_evaluation_operators",
                "text_process_operators",
                "text_generate_operators",
            ]
        },
        {
            text: "Domain-Specific Operators",
            collapsed: false,
            icon: 'material-symbols:analytics-outline',
            prefix: 'domain_specific_operators',
            items: [
                "reasoning_operators",
                "text2sql_operators",
                "rare_operators",
                "knowledgebase_QA_operators",
                "agenticrag_operators",
            ]
        },
        {
            text: "Agent for Dataflow",
            collapsed: false,
            icon: 'mdi:face-agent',
            prefix: 'agent',
            items: [
                "agent_for_data"
            ]
        },
    ],
})
