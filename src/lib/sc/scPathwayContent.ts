import type { SCPathway } from './scScoring';

export const SC_PATHWAY_LABELS: Record<SCPathway, string> = {
  'home-family-support':     'Home with Family Support',
  'home-professional-hca':   'Home with Professional Support',
  'independent-living':      'Independent Living',
  'assisted-living':         'Assisted Living',
  'memory-care':             'Memory Care',
  'residential-care-home':   'Residential Care Home',
  'complex-medical-consult': 'Complex Medical Assessment',
};

export interface SCPathwayContent {
  anticipationBullets: [string, string, string];
  about: string;
  whyFits: string;
  anticipate: [string, string, string];
  whatFamiliesDontKnow: string;
  alsoConsidering: string;
}

export const SC_PATHWAY_CONTENT: Record<SCPathway, SCPathwayContent> = {
  'home-family-support': {
    anticipationBullets: [
      'What early changes families most often underestimate -- and why it matters now',
      'How to set up support at home so it works long-term, not just for this month',
      'The sign that tells you when this option has stopped being the right fit',
    ],
    about:
      'Home with family support works well when the need is real but manageable -- and when the people providing that support have enough bandwidth to do it well. The key is building a structure that holds without burning anyone out.',
    whyFits:
      "Based on what you shared, your loved one's needs are at a level where staying home with the right family involvement looks feasible. The goal is making sure that support is sustainable -- for everyone involved.",
    anticipate: [
      'Needs tend to increase gradually. What works now may need adjustment in six to twelve months.',
      'Family caregiving works best with clear roles and honest conversations about limits.',
      'Knowing what the next step would look like -- before you need it -- makes that transition much easier.',
    ],
    whatFamiliesDontKnow:
      "Many families in this situation wait too long to involve outside support -- not because they don't need it, but because they don't want to admit it. The families who navigate this best are the ones who build a broader support structure early, while there's still time to do it without pressure.",
    alsoConsidering:
      'Home with Professional Support -- if the caregiving load increases or consistency becomes a concern, bringing in professional help is often the bridge that keeps a parent home longer.',
  },

  'home-professional-hca': {
    anticipationBullets: [
      'What separates a reliable home care agency from one that will let you down at the worst possible moment',
      "Which specific services are worth paying for -- and which ones families often pay for but don't actually need",
      'How to know when home care is working, and when it has reached its limit',
    ],
    about:
      'Professional home care brings trained support into the home on a scheduled basis. It works well when the need is consistent and the home environment is set up to support it. The quality of the agency matters enormously.',
    whyFits:
      "What you've shared suggests a level of need that goes beyond what family support alone can reliably provide. Professional help at home could be the right next step -- if the right agency and services are matched to the specific situation.",
    anticipate: [
      'Consistency matters. Ask agencies specifically how they handle caregiver call-outs -- this is where most families run into problems.',
      'Costs vary significantly depending on hours and services. Understanding the full picture before committing is worth the extra time.',
      'This option works best when someone is overseeing the arrangement -- not just assuming it is running well.',
    ],
    whatFamiliesDontKnow:
      'Most families choose a home care agency based on price or availability. The families who get the best outcomes choose based on how the agency handles problems -- because problems always come up. Knowing what questions to ask before you sign anything is the difference between a good experience and a very difficult one.',
    alsoConsidering:
      'Assisted Living -- if professional support at home becomes difficult to coordinate or needs increase beyond what home care can reliably cover, an assisted living community may offer more consistent support with less family coordination required.',
  },

  'independent-living': {
    anticipationBullets: [
      'What independent living actually includes -- and what it does not',
      'Why isolation is often the real driver behind a move, even when families think it is about safety',
      'How to evaluate whether a community will actually feel like home',
    ],
    about:
      'Independent living communities are designed for older adults who are largely self-sufficient but want connection, activities, and the security of a supportive environment without the isolation of living alone.',
    whyFits:
      'Based on what you shared, the physical care needs appear manageable -- but engagement and social connection stand out as the area where something has shifted. Independent living addresses exactly that.',
    anticipate: [
      'The adjustment period is real. Most residents take two to three months to feel at home. The ones who do best get involved early.',
      'Not all communities are the same. Programming, culture, and the physical environment vary significantly.',
      'Independent living does not provide personal care. If that need develops, understanding what the next step looks like is important.',
    ],
    whatFamiliesDontKnow:
      "Most families think of independent living as a last resort. The families who are happiest with the decision are usually the ones who made it before they had to. Moving from a place of choice rather than a place of crisis makes an enormous difference in how the transition feels.",
    alsoConsidering:
      'Assisted Living -- if personal care needs develop or the level of support in independent living feels insufficient, assisted living is typically the natural next step.',
  },

  'assisted-living': {
    anticipationBullets: [
      'What assisted living actually covers -- and the gaps families are often surprised by',
      'How to compare communities without being misled by the tour',
      'The questions that reveal what a community is actually like to live in',
    ],
    about:
      'Assisted living provides daily support with personal care, meals, activities, and safety oversight in a residential setting. It works well when the level of need has grown beyond what home support can reliably cover.',
    whyFits:
      "What you've shared points to a level of need where consistent, professional support -- around the clock or close to it -- would make a meaningful difference. Assisted living is designed for exactly this stage.",
    anticipate: [
      "Tours are designed to impress. The experience of living there day-to-day is what matters -- and that takes more than one visit to understand.",
      'Costs vary significantly by community, location, and level of care. Understanding how pricing works before you tour saves a lot of confusion.',
      'The right fit depends on more than amenities. Culture, staffing, and how the community handles difficult situations matter most.',
    ],
    whatFamiliesDontKnow:
      "Most families tour three communities and choose the one that looked the best. The families who end up happiest with their choice go deeper -- they talk to residents, ask about staff turnover, and look at state inspection records. That information is public and most families never look at it.",
    alsoConsidering:
      'Memory Care -- if cognitive changes are a significant part of the picture, a memory care community offers a more structured environment designed specifically for that situation.',
  },

  'memory-care': {
    anticipationBullets: [
      'What memory care offers that assisted living does not -- and why it matters',
      'How to evaluate a memory care community beyond what the tour shows you',
      'What families wish they had known before making this decision',
    ],
    about:
      'Memory care communities are a specialized form of assisted living designed for individuals experiencing significant cognitive changes. The environment, programming, and staffing are structured specifically around memory and cognitive support.',
    whyFits:
      "The cognitive changes you've described are at a level where a specialized memory care environment may offer significantly better support than general assisted living or home care. This is not about giving up -- it is about finding the setting where your loved one can be safest and most engaged.",
    anticipate: [
      'The physical environment matters enormously in memory care. Secure, calm, and purposefully designed spaces make a real difference.',
      'Programming in memory care is designed differently than in assisted living -- music, sensory engagement, and structured routine are central.',
      'This decision is often emotionally complex for families. Having someone who has navigated it before helps.',
    ],
    whatFamiliesDontKnow:
      'Memory care is a subset of assisted living -- not a separate category. This means quality varies just as much, and the same due diligence applies. State inspection records, staff-to-resident ratios, and how a community handles behavioral situations are all worth looking into before committing.',
    alsoConsidering:
      'Residential Care Home -- for some families, a smaller, more intimate setting with fewer residents feels like a better fit, especially for individuals who may be overwhelmed by larger community environments.',
  },

  'residential-care-home': {
    anticipationBullets: [
      'What a residential care home offers that larger communities do not',
      'How to find and vet a residential care home in your area',
      'What to look for -- and what to watch out for -- in a smaller setting',
    ],
    about:
      'Residential care homes are smaller, home-like settings -- often six to eight residents -- that provide personal care in an intimate environment. They are a good option for families who want a closer-knit, less institutional setting.',
    whyFits:
      'Based on what you shared, a smaller, more personal environment may be a better fit than a larger assisted living community. Residential care homes offer a higher staff-to-resident ratio and a more consistent daily routine.',
    anticipate: [
      'Quality varies significantly. Licensing, inspection history, and the specific caregiving team matter more in smaller settings.',
      'Activities and programming are more limited than in larger communities. If social engagement and structured programming are important, this is worth factoring in.',
      'These homes are harder to find and evaluate without guidance. There is no equivalent of a large community\'s marketing department to walk you through the options.',
    ],
    whatFamiliesDontKnow:
      "Most families never consider residential care homes because they don't know they exist. For the right situation, they can offer a level of consistency and personal attention that larger communities simply cannot match. The challenge is knowing how to find and evaluate them.",
    alsoConsidering:
      'Assisted Living -- if programming, social activities, or a broader range of on-site services are important priorities, a larger assisted living community may be worth considering alongside residential care home options.',
  },

  'complex-medical-consult': {
    anticipationBullets: [
      'Why getting the right clinical picture first changes every decision that follows',
      "What a professional assessment covers -- and why it is different from a doctor's appointment",
      'How to move forward when the situation feels too complicated to sort out',
    ],
    about:
      'When care needs are complex, the most important first step is getting a clear clinical picture before making placement decisions. A geriatric care manager or similar professional can assess the full situation and provide guidance grounded in the specific medical and functional reality.',
    whyFits:
      "What you've shared suggests a level of complexity that goes beyond what a general care assessment can fully address. The right next step is a clinical evaluation -- not to delay action, but to make sure the action you take is the right one.",
    anticipate: [
      'A professional assessment typically takes one to two hours and covers medical, functional, cognitive, and social factors.',
      'The output is a care plan -- a specific set of recommendations, not just a general direction.',
      'This step often makes every subsequent decision faster and more confident.',
    ],
    whatFamiliesDontKnow:
      'Most families skip the clinical assessment step because it feels like a delay. The families who go through it consistently say it saved them from making a costly decision in the wrong direction. When the situation is complicated, getting the right picture first is the fastest path forward.',
    alsoConsidering:
      'Assisted Living or Memory Care -- once a clinical picture is clearer, a placement decision can be made from a much stronger foundation. ELT can help you move from assessment to placement when you are ready.',
  },
};
