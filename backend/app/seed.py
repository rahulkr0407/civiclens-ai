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
            },
            {
                "name": "GST Portal — Goods and Services Tax Network",
                "url": "https://www.gst.gov.in/"
            },
            {
                "name": "CBIC — Central Board of Indirect Taxes and Customs",
                "url": "https://www.cbic.gov.in/"
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
                "url": "https://www.education.gov.in/en/national-education-policy-2020-0"
            },
            {
                "name": "National Education Policy 2020 (Full Text PDF) — Ministry of Education",
                "url": "https://www.education.gov.in/sites/upload_files/mhrd/files/NEP_Final_English_0.pdf"
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
            },
            {
                "name": "The Farm Laws Repeal Act, 2021 — India Code",
                "url": "https://www.indiacode.nic.in/handle/123456789/16976"
            }
        ]
    },

    {
        "id": "dpdp-2023",
        "title": "DPDP Act 2023",
        "category": "Technology",
        "summary": "The Digital Personal Data Protection Act 2023 is India's law that sets rules for how organizations collect and process personal data.",
        "readTime": "6 min",

        "whyItMatters": "The DPDP Act affects the rights of every person online, and the obligations of companies and apps that handle personal data.",

        "keyPoints": [
            "It applies to the processing of digital personal data in India.",
            "It requires consent before personal data can be processed for most purposes.",
            "It gives individuals rights such as access, correction and erasure of their data.",
            "It sets up a Data Protection Board and penalties for non-compliance."
        ],

        "viewpoints": [
            {
                "side": "Supporters",
                "explanation": "Supporters say the law strengthens privacy, makes consent central, and gives people more control over their personal data."
            },
            {
                "side": "Critics",
                "explanation": "Critics have raised concerns about certain exemptions, how the rules will be carried out, and the readiness of organizations to comply."
            }
        ],

        "currentSituation": "The Act has been passed, and the rules under it have been published for consultation and implementation.",

        "sources": [
            {
                "name": "Digital Personal Data Protection Act 2023 — MeitY, Government of India",
                "url": "https://www.meity.gov.in/content/digital-personal-data-protection-act-2023"
            },
            {
                "name": "Digital Personal Data Protection Bill — PRS Legislative Research",
                "url": "https://prsindia.org/billtrack/digital-personal-data-protection-bill-2023"
            }
        ]
    },

    {
        "id": "upi",
        "title": "UPI",
        "category": "Economy",
        "summary": "Unified Payments Interface (UPI) is an instant payment system that lets people transfer money between bank accounts using mobile apps.",
        "readTime": "5 min",

        "whyItMatters": "UPI is one of the most widely used ways to pay in India, covering everyday purchases, bills and transfers.",

        "keyPoints": [
            "UPI allows instant money transfers between bank accounts.",
            "It works round the clock, including weekends and holidays.",
            "Users can link multiple bank accounts in one UPI app.",
            "It supports QR-code payments at shops and online."
        ],

        "viewpoints": [
            {
                "side": "Supporters",
                "explanation": "Supporters say UPI is convenient, fast and low-cost, and has helped expand digital payments in India."
            },
            {
                "side": "Critics",
                "explanation": "Critics have raised concerns about digital payment fraud, safety for less experienced users, and access for people without smartphones."
            }
        ],

        "currentSituation": "UPI continues to grow in India and is also being enabled for use in other countries.",

        "sources": [
            {
                "name": "Unified Payment Interface (UPI) — Digital India, MeitY",
                "url": "https://www.digitalindia.gov.in/initiative/unified-payment-interface-upi/"
            },
            {
                "name": "UPI Product Overview — National Payments Corporation of India",
                "url": "https://www.npci.org.in/what-we-do/upi/product-overview"
            }
        ]
    },

    {
        "id": "electoral-bonds",
        "title": "Electoral Bonds",
        "category": "Governance",
        "summary": "Electoral Bonds were a scheme that allowed donations to political parties through bank bonds, and were struck down by the Supreme Court in 2024.",
        "readTime": "6 min",

        "whyItMatters": "Political funding affects how democracy and elections work, and who they may depend on for support.",

        "keyPoints": [
            "Electoral Bonds were introduced in 2018 as a way to donate to political parties.",
            "Bonds could be bought from a bank and donated without publicly declaring the donor.",
            "The State Bank of India was the authorised issuer of these bonds.",
            "In February 2024, the Supreme Court struck down the scheme as unconstitutional."
        ],

        "viewpoints": [
            {
                "side": "Supporters",
                "explanation": "Supporters argued electoral bonds could reduce cash donations and let donors support parties without fear of targeting."
            },
            {
                "side": "Critics",
                "explanation": "Critics said anonymous donations reduce transparency and can allow donors to influence political parties in secret."
            }
        ],

        "currentSituation": "The scheme has been struck down by the Supreme Court, and information about the bonds was shared with the Election Commission of India.",

        "sources": [
            {
                "name": "Electoral Bonds — Election Commission of India",
                "url": "https://www.eci.gov.in/electoral-bonds"
            },
            {
                "name": "Electoral Bonds General — Election Commission of India",
                "url": "https://eci.gov.in/general/electoral-bonds"
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


print(f"✅ All {len(topics)} topics updated successfully!")