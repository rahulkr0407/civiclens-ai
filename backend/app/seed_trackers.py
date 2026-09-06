"""Seed the civic trackers collection.

Run from backend/:  .\\.venv\\Scripts\\python.exe -m app.seed_trackers

Content is curated, politically neutral, and sourced from official or
reputable public information (PRS Legislative Research, Parliament
session records, News on Air). Statuses are as of September 2026.
"""

from app.db.database import trackers_collection


trackers = [
    # =========================
    # Bills
    # =========================
    {
        "id": "public-examinations-amendment",
        "type": "bill",
        "title": "Public Examinations (Prevention of Unfair Means) Amendment Bill, 2026",
        "category": "Education",
        "status": "Passed by both Houses",
        "stage": "Awaiting Presidential assent",
        "summary": (
            "The Bill amends the Public Examinations (Prevention of Unfair Means) Act, "
            "2024 to strengthen the response to question-paper leaks and organised "
            "examination fraud. It raises penalties, adds a Special Task Force for "
            "time-bound (2-month) investigations, and requires Special Fast-Track "
            "Courts to try cases within 3 months of the chargesheet."
        ),
        "viewpoints": [
            {
                "side": "Supporters",
                "explanation": "The Government and parties supporting the Bill argue that stricter "
                "penalties, fast-track courts and task forces will deter paper leaks and "
                "protect the credibility of competitive examinations.",
            },
            {
                "side": "Critics",
                "explanation": "Some Members and commentators argue that tougher punishment alone "
                "will not fix systemic issues, and have sought deeper reforms to the "
                "examination system itself.",
            },
        ],
        "lastUpdated": "2026-07-30",
        "sources": [
            {
                "name": "PRS Legislative Research — Bill page",
                "url": "https://prsindia.org/billtrack/the-public-examinations-prevention-of-unfair-means-amendment-bill-2026",
            },
            {
                "name": "News on Air (Government of India) — Passing",
                "url": "https://newsonair.gov.in/parliament-passes-public-examinations-prevention-of-unfair-means-amendment-bill-2026/",
            },
        ],
    },
    {
        "id": "sc-number-of-judges-amendment",
        "type": "bill",
        "title": "Supreme Court (Number of Judges) Amendment Bill, 2026",
        "category": "Judiciary",
        "status": "Passed by both Houses",
        "stage": "Awaiting Presidential assent",
        "summary": (
            "The Bill increases the sanctioned strength of judges of the Supreme Court "
            "of India from 33 to 37 (excluding the Chief Justice of India). It was "
            "introduced in the Lok Sabha on July 20, 2026 and passed by both Houses by "
            "early August 2026, with the aim of helping reduce case pendency."
        ),
        "lastUpdated": "2026-08-05",
        "sources": [
            {
                "name": "PRS Legislative Research — Monsoon Session 2026",
                "url": "https://prsindia.org/sessiontrack/monsoon-session-2026/bill-legislation",
            },
        ],
    },
    {
        "id": "fcra-amendment",
        "type": "bill",
        "title": "Foreign Contribution (Regulation) Amendment Bill, 2026",
        "category": "Governance",
        "status": "In Committee",
        "stage": "Referred to a Joint Parliamentary Committee (Aug 2026)",
        "summary": (
            "The Bill amends the Foreign Contribution (Regulation) Act, 2010, which "
            "regulates foreign donations to Indian organisations. Introduced in the Lok "
            "Sabha on March 25, 2026, it creates a Designated Authority to take over, "
            "manage and dispose of foreign contribution and assets of an organisation "
            "whose FCRA certificate is cancelled, surrendered, or ceases on non-renewal."
        ),
        "viewpoints": [
            {
                "side": "Government view",
                "explanation": "The Ministry of Home Affairs says the Bill increases oversight of "
                "foreign-funded assets when certificates lapse, to prevent diversion "
                "detrimental to national interest.",
            },
            {
                "side": "Concerns raised",
                "explanation": "PRS and several organisations note the Bill may lead to loss of "
                "assets created with foreign funds on non-renewal, and that it does not "
                "provide an appeal mechanism against denial of renewal.",
            },
        ],
        "lastUpdated": "2026-08-12",
        "sources": [
            {
                "name": "PRS Legislative Research — Bill page",
                "url": "https://prsindia.org/billtrack/the-foreign-contribution-regulation-amendment-bill-2026",
            },
        ],
    },
    {
        "id": "births-deaths-amendment",
        "type": "bill",
        "title": "Registration of Births and Deaths (Amendment) Bill, 2026",
        "category": "Governance",
        "status": "Passed by both Houses",
        "stage": "Awaiting Presidential assent",
        "summary": (
            "The Bill amends the Registration of Births and Deaths Act, 1969 to tighten "
            "procedures around the delayed registration of births and deaths. It was "
            "introduced in the Lok Sabha on July 29, 2026 and passed by both Houses in "
            "early August 2026."
        ),
        "lastUpdated": "2026-08-04",
        "sources": [
            {
                "name": "PRS Legislative Research — Monsoon Session 2026",
                "url": "https://prsindia.org/sessiontrack/monsoon-session-2026/bill-legislation",
            },
        ],
    },
    {
        "id": "insults-to-national-honour-amendment",
        "type": "bill",
        "title": "Prevention of Insults to National Honour (Amendment) Bill, 2026",
        "category": "Governance",
        "status": "Passed by both Houses",
        "stage": "Awaiting Presidential assent",
        "summary": (
            "The Bill amends the Prevention of Insults to National Honour Act, 1971 to "
            "strengthen legal provisions against acts considered disrespectful to "
            "national symbols and national honour, including the National Flag and "
            "National Anthem. It was passed by the Rajya Sabha on July 29 and the Lok "
            "Sabha on July 30, 2026."
        ),
        "lastUpdated": "2026-07-30",
        "sources": [
            {
                "name": "PRS Legislative Research — Monsoon Session 2026",
                "url": "https://prsindia.org/sessiontrack/monsoon-session-2026/bill-legislation",
            },
        ],
    },
    {
        "id": "msme-development-amendment",
        "type": "bill",
        "title": "Micro, Small and Medium Enterprises Development (Amendment) Bill, 2026",
        "category": "Economy",
        "status": "Passed by both Houses",
        "stage": "Awaiting Presidential assent",
        "summary": (
            "The Bill amends the MSME Development Act, 2006 to improve ease of doing "
            "business, strengthen safeguards against delayed payments to small suppliers, "
            "and enhance the role of states in MSME regulation. It was passed by the "
            "Rajya Sabha on August 3 and the Lok Sabha on August 7, 2026."
        ),
        "lastUpdated": "2026-08-07",
        "sources": [
            {
                "name": "PRS Legislative Research — Monsoon Session 2026",
                "url": "https://prsindia.org/sessiontrack/monsoon-session-2026/bill-legislation",
            },
        ],
    },
    {
        "id": "taxation-and-other-laws-amendment",
        "type": "bill",
        "title": "Taxation and Other Laws (Amendment) Bill, 2026",
        "category": "Finance",
        "status": "Passed by both Houses",
        "stage": "Awaiting Presidential assent",
        "summary": (
            "Introduced in the Lok Sabha on August 4, 2026, the Bill makes a set of "
            "taxation and other statutory amendments taken up in the Monsoon Session, "
            "including measures linked to India's sovereign debt market and market "
            "liquidity. It was passed by the Lok Sabha on August 6 and the Rajya Sabha "
            "on August 10, 2026."
        ),
        "lastUpdated": "2026-08-10",
        "sources": [
            {
                "name": "PRS Legislative Research — Monsoon Session 2026",
                "url": "https://prsindia.org/sessiontrack/monsoon-session-2026/bill-legislation",
            },
        ],
    },
    {
        "id": "viksit-bharat-shiksha-adhishthan",
        "type": "bill",
        "title": "Viksit Bharat Shiksha Adhishthan Bill, 2025",
        "category": "Education",
        "status": "In Committee",
        "stage": "Under review by a Joint Parliamentary Committee since Dec 2025",
        "summary": (
            "An education-sector Bill introduced in the Lok Sabha in December 2025. It "
            "was referred to a Joint Parliamentary Committee for detailed examination "
            "and had been pending as the panel's report was awaited ahead of the 2026 "
            "Monsoon Session."
        ),
        "lastUpdated": "2026-07-18",
        "sources": [
            {
                "name": "Mathrubhumi — Monsoon Session agenda",
                "url": "https://english.mathrubhumi.com/amp/news/india/monsoon-session-2026-government-likely-to-table-five-new-bills-push-two-pending-legislations-mznj7svx",
            },
        ],
    },
    {
        "id": "delimitation-bills-2026",
        "type": "bill",
        "title": "Delimitation Bills, 2026 (Constitution 131st Amendment, Delimitation, UT Laws)",
        "category": "Polity",
        "status": "Negatived / Infructuous",
        "stage": "Special session of April 2026",
        "summary": (
            "Three linked Bills — the Constitution (131st Amendment) Bill, the "
            "Delimitation Bill and the Union Territories Laws (Amendment) Bill, all "
            "2026 — were introduced in the Lok Sabha on April 16, 2026. They proposed "
            "to raise the Lok Sabha's maximum strength from 550 to 850 and carry out "
            "delimitation based on the 2011 Census. The Constitution amendment was "
            "negatived in the Lok Sabha on April 17, 2026, and the linked Bills were "
            "rendered infructuous."
        ),
        "viewpoints": [
            {
                "side": "Government view",
                "explanation": "Supporters said the Bills would enable proportional representation, "
                "delimitation under a modern census, and give effect to women's "
                "reservation; the Home Minister assured southern states their seat "
                "share would not fall.",
            },
            {
                "side": "Opposition view",
                "explanation": "Opposition parties argued the Bills were rushed and could change the "
                "electoral balance; the Constitution amendment failed to secure the "
                "required support when put to a vote.",
            },
        ],
        "lastUpdated": "2026-04-17",
        "sources": [
            {
                "name": "PRS Legislative Research — Constitution (131st Amendment) Bill, 2026",
                "url": "https://prsindia.org/billtrack/the-constitution-131st-amendment-bill-2026",
            },
            {
                "name": "News on Air (Government of India) — Lok Sabha consideration",
                "url": "https://newsonair.gov.in/parliament-budget-session-begins-opposition-protests-against-key-bills/",
            },
        ],
    },
    # =========================
    # Protests
    # =========================
    {
        "id": "farmers-kisan-bachao-padyatra",
        "type": "protest",
        "title": "Farmers' 'Kisan Bachao Padyatra' (Khanauri / Shambhu)",
        "category": "Agriculture",
        "status": "Active",
        "stage": "March blocked at the Haryana-Punjab border",
        "summary": (
            "Farmer unions affiliated with the Samyukta Kisan Morcha (Non-Political) "
            "launched a foot march ('Kisan Bachao Padyatra') from Punjab towards Delhi "
            "in August 2026 to press for a legal guarantee of Minimum Support Price, "
            "debt relief, and withdrawal of earlier cases, and to voice opposition to "
            "the India-US trade framework. Haryana authorities declined permission and "
            "barricaded the route at Khanauri; talks have not resolved the standoff."
        ),
        "viewpoints": [
            {
                "side": "Protesters",
                "explanation": "Farm unions say the India-US trade deal could let in cheaper imports "
                "and hurt farmers, and renew their demand for a statutory MSP guarantee.",
            },
            {
                "side": "Government",
                "explanation": "The Government says 90-95% of agricultural products are excluded "
                "from the trade framework, staple grains and dairy are protected, and "
                "the administration cites legal requirements (permission, public "
                "order) for regulating the march.",
            },
        ],
        "lastUpdated": "2026-08-17",
        "sources": [
            {
                "name": "Down To Earth — Marches against India-US talks stopped",
                "url": "https://www.downtoearth.org.in/agriculture/farmers-protest-against-india-us-trade-talks-as-convoys-stopped-near-delhi",
            },
            {
                "name": "Reuters — Farm unions vow to fight India-US trade pact",
                "url": "https://www.reuters.com/world/india/indian-farm-unions-opposition-vow-fight-india-us-trade-pact-2026-02-09/",
            },
        ],
    },
    {
        "id": "neet-paper-leak-protests",
        "type": "protest",
        "title": "NEET-UG paper leak protests (Jantar Mantar, Delhi)",
        "category": "Education",
        "status": "Active",
        "stage": "Student protests at Jantar Mantar; parliamentary response enacted",
        "summary": (
            "Arising from the NEET-UG paper leak controversy, students and civil society "
            "groups have protested at Jantar Mantar in Delhi demanding accountability "
            "and systemic changes. The parliamentary response was the Public "
            "Examinations (Prevention of Unfair Means) Amendment Bill, 2026, which "
            "tightened penalties and introduced fast-track courts, passed by both "
            "Houses in late July 2026."
        ),
        "viewpoints": [
            {
                "side": "Protesters",
                "explanation": "Protesters say leak investigations and transparency are central; some "
                "demand deeper examination reform, and there have been calls to review "
                "or abolish entrance-based tests like NEET.",
            },
            {
                "side": "Government",
                "explanation": "The Government says the strengthened anti-cheating law — with Special "
                "Task Forces and fast-track courts — addresses the issue, and has cited "
                "the NTA and implementing agencies as taking corrective action.",
            },
        ],
        "lastUpdated": "2026-07-31",
        "sources": [
            {
                "name": "News on Air (Government of India) — Parliament passes anti-paper-leak Bill",
                "url": "https://newsonair.gov.in/parliament-passes-public-examinations-prevention-of-unfair-means-amendment-bill-2026/",
            },
            {
                "name": "SCC Times — NEET 2026 paper leak controversy explainer",
                "url": "https://www.scconline.com/blog/post/2026/05/15/neet-2026-paper-leak-examination-incident-explained/",
            },
        ],
    },
    {
        "id": "bidadi-ai-township-land-protest",
        "type": "protest",
        "title": "Bidadi 'AI Township' land protest (Karnataka)",
        "category": "Land & Development",
        "status": "Active",
        "stage": "Survey halted after clashes; FIRs registered",
        "summary": (
            "Farmers and residents near Bidadi in Ramanagara district, Karnataka "
            "oppose the land acquisition process for a proposed 'AI Township'. "
            "Opposition to a survey escalated into clashes between farmers and "
            "officials/police in mid-July 2026, and two FIRs were registered. Farmers "
            "say they will not allow the survey to proceed."
        ),
        "viewpoints": [
            {
                "side": "Protesters",
                "explanation": "Farmers say the acquisition would displace them and affect their "
                "livelihoods, and that they were not adequately consulted before the "
                "survey.",
            },
            {
                "side": "Government / developer",
                "explanation": "The Karnataka development authorities describe the AI Township as an "
                "economic growth project and state the survey is a legal step in land "
                "acquisition; police have registered FIRs over the clashes.",
            },
        ],
        "lastUpdated": "2026-07-14",
        "sources": [
            {
                "name": "India Today — Two FIRs after violence during township survey",
                "url": "https://www.indiatoday.in/india/karnataka/story/bidadi-ai-township-protest-second-fir-over-attack-on-officials-during-ramanagara-land-survey-2947469-2026-07-14",
            },
            {
                "name": "India Today — Township survey turns violent",
                "url": "https://www.indiatoday.in/india/karnataka/story/bidadi-township-land-survey-violent-karnataka-farmers-protest-bengaluru-2946847-2026-07-13",
            },
        ],
    },
    {
        "id": "bharat-bandh-feb-2026",
        "type": "protest",
        "title": "Bharat Bandh and nationwide strikes (Feb 2026)",
        "category": "Labour",
        "status": "Concluded",
        "stage": "One-day nationwide shutdown on 12 Feb 2026",
        "summary": (
            "Trade unions and farm organisations called a one-day nationwide 'Bharat "
            "Bandh' on February 12, 2026 against labour code implementations, "
            "privatisation, the India-US trade framework and agricultural policies. "
            "The shutdown was followed by continued farmers' mobilisation at borders. "
            "It has since concluded."
        ),
        "viewpoints": [
            {
                "side": "Organisers",
                "explanation": "Unions and farm groups described the strike as resistance to "
                "anti-worker, anti-farmer policies and disputed the labour codes and "
                "trade terms.",
            },
            {
                "side": "Government",
                "explanation": "The Government defended the labour codes and the trade framework, "
                "citing protections for agriculture and calling the strike politically "
                "motivated.",
            },
        ],
        "lastUpdated": "2026-02-12",
        "sources": [
            {
                "name": "Frontline (The Hindu) — Bharat Bandh 2026 coverage",
                "url": "https://frontline.thehindu.com/news/india-bharat-bandh-2026-strike/article70624271.ece",
            },
            {
                "name": "Reuters — Workers and farmers strike",
                "url": "https://www.reuters.com/world/india/around-90-95-indian-farm-products-kept-out-us-deal-indian-trade-minister-says-2026-02-12/",
            },
        ],
    },
]


for tracker in trackers:
    trackers_collection.update_one(
        {"id": tracker["id"]},
        {"$set": tracker},
        upsert=True,
    )


print(f"✅ All {len(trackers)} trackers updated successfully!")