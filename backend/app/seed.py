from app.db.database import topics_collection


topics = [
    {
        "id": "gst",
        "title": "GST",
        "category": "Economy",
        "summary": "Goods and Services Tax is an indirect tax system introduced in India to combine several indirect taxes.",
        "readTime": "5 min",

        "whyItMatters": "GST affects the prices of many goods and services and is an important part of India's tax system.",

        "keyPoints": [
            "GST is an indirect tax.",
            "It replaced several central and state indirect taxes.",
            "GST is collected at different stages of the supply chain.",
            "The final burden is generally borne by the consumer."
        ],

        "viewpoints": [
            {
                "side": "Supporters",
                "explanation": "Supporters argue that GST created a more unified tax structure and simplified taxation across states."
            },
            {
                "side": "Critics",
                "explanation": "Critics have raised concerns about compliance complexity, tax rates and the impact on some businesses."
            }
        ],

        "currentSituation": "GST continues to be an important part of India's indirect tax system.",

        "sources": [
            {
                "name": "GST Council — Government of India",
                "url": "https://www.gstcouncil.gov.in/"
            }
        ]
    },

    {
        "id": "nep-2020",
        "title": "NEP 2020",
        "category": "Education",
        "summary": "National Education Policy 2020 is India's education policy aimed at changing how students learn from school through higher education.",
        "readTime": "6 min",

        "whyItMatters": "NEP 2020 affects India's education system, including school education, higher education and skill development.",

        "keyPoints": [
            "It introduced a new 5+3+3+4 school structure.",
            "It emphasizes foundational literacy and numeracy.",
            "It promotes multidisciplinary education.",
            "It gives greater importance to skills and practical learning."
        ],

        "viewpoints": [
            {
                "side": "Supporters",
                "explanation": "Supporters believe the policy can make education more flexible, practical and focused on overall development."
            },
            {
                "side": "Critics",
                "explanation": "Critics have raised concerns about implementation, funding, infrastructure and differences between states."
            }
        ],

        "currentSituation": "NEP 2020 is being implemented progressively across India's education system.",

        "sources": [
            {
                "name": "National Education Policy 2020 — Ministry of Education",
                "url": "https://www.education.gov.in/nep-national-education-policy-2020"
            }
        ]
    },

    {
        "id": "farmers-protest",
        "title": "Farmers Protest",
        "category": "Agriculture",
        "summary": "The farmers' protests involved demonstrations over agricultural laws, farm incomes and concerns about government policies.",
        "readTime": "7 min",

        "whyItMatters": "Agriculture affects farmers, consumers, food supply and a significant part of India's economy.",

        "keyPoints": [
            "Farmers raised concerns about agricultural laws and market conditions.",
            "Minimum Support Price was an important issue in discussions.",
            "Large demonstrations took place in and around Delhi.",
            "The protests led to major political and public debate."
        ],

        "viewpoints": [
            {
                "side": "Farmers' concerns",
                "explanation": "Many protesting farmers were concerned about market security, prices and the future of government procurement."
            },
            {
                "side": "Government perspective",
                "explanation": "The government argued that agricultural reforms could provide farmers with more market opportunities and choices."
            }
        ],

        "currentSituation": "The farmers' protests became a major national discussion about agricultural policy and farmer welfare.",

        "sources": [
            {
                "name": "Farm Laws Repeal Bill, 2021 — PRS Legislative Research",
                "url": "https://prsindia.org/billtrack/the-farm-laws-repeal-bill-2021"
            }
        ]
    }
]


for topic in topics:
    topics_collection.update_one(
        {"id": topic["id"]},
        {"$set": topic},
        upsert=True
    )


print("✅ All 3 topics updated successfully!")