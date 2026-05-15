/**
 * SNF pathway display content — copy for results page and email report.
 * All seven pathways defined. Update copy here; results page and email
 * templates both pull from this single source.
 */

import type { SnfPathway } from './quiz/snf-scoring';

export interface SnfPathwayContent {
  fullDescription: string;
  whyThisFits: string;
  anticipationBullets: [string, string, string];
  whatFamiliesDontKnow: string;
  /** Condensed secondary pathway — heading + one sentence. */
  secondaryPathway: string;
  /** Optional CTA subtext override (home-family and complex-medical only). */
  ctaSubtext?: string;
}

export const SNF_PATHWAY_CONTENT: Record<SnfPathway, SnfPathwayContent> = {
  'assisted-living': {
    fullDescription:
      'Assisted living communities provide personal care support — help with bathing, dressing, medications, and meals — in a residential setting with common areas, activities, and 24-hour staff available. Your loved one would have their own apartment or room with privacy, while having access to support whenever it is needed. Some communities offer shared apartment arrangements that can meaningfully reduce monthly costs.',
    whyThisFits:
      'Based on what you shared, your loved one may need more daily support than can realistically be provided at home, but does not appear to require the level of medical oversight provided in a skilled nursing setting. Assisted living appears to be worth exploring as a balance of independence and structured daily support.',
    anticipationBullets: [
      'Pricing structures vary significantly between communities — and how you time the move and negotiate the agreement can affect what you pay long-term. This is one of the first things ELT walks families through before any tour happens.',
      'Not all assisted living communities are the same caliber, even within the same zip code. ELT evaluates communities against criteria that are not visible on a tour — and what we find regularly changes which options we recommend to families.',
      'The communities that market most aggressively are not always the strongest performers on safety and staffing. ELT knows which local communities have earned their reputation and which ones are still working on it.',
    ],
    whatFamiliesDontKnow:
      'Most assisted living communities charge a base monthly rate plus a care level add-on that increases as your loved one\'s needs change — sometimes significantly. Understanding how that pricing escalates over time, and what triggers a care level increase, is one of the most important things to negotiate before signing. ELT reviews contracts with families before any commitment is made. Beyond pricing, the factors that most reliably predict a community\'s performance — staffing consistency, state inspection history, how they handle care level transitions, and how responsive leadership is when something goes wrong — are not visible on a tour and not disclosed in marketing materials. These are the criteria ELT evaluates before recommending any community to a family.',
    secondaryPathway:
      'Also worth exploring — Independent Living with Home Care Support: If your loved one is cognitively intact and relatively independent, an independent living community combined with scheduled home care visits is worth a closer look — with more flexibility as needs change.',
  },

  'memory-care': {
    fullDescription:
      'Memory care communities are specifically designed for individuals living with Alzheimer\'s, dementia, or other forms of cognitive impairment. They offer a secured environment, structured daily routines, and staff trained in dementia care — all of which reduce confusion, agitation, and safety risk in ways that a standard assisted living or home setting typically cannot.',
    whyThisFits:
      'Based on what you shared, cognitive changes appear to be a significant factor in your loved one\'s current situation. Memory care may offer a level of specialized support, safety, and daily structure that is difficult to replicate in other settings — and that often makes a meaningful difference in quality of life for both your loved one and your family.',
    anticipationBullets: [
      'Memory care communities vary enormously in their approach to dementia programming — the difference between communities that keep residents genuinely engaged versus those that do not is visible when you know what to look for. ELT evaluates this before recommending any community to a family.',
      'The physical environment in a memory care unit matters as much as the staffing — layout, lighting, outdoor access, and sensory design all affect behavior and wellbeing in ways that are not obvious on a standard tour. This is part of what ELT assesses.',
      'The safety and staffing track record of memory care units is not visible on a tour or in marketing materials. ELT reviews this history for every community we recommend — and the findings regularly change which options we suggest to families.',
    ],
    whatFamiliesDontKnow:
      'Many families assume memory care is only appropriate for late-stage dementia. In reality, earlier placement often produces significantly better outcomes — residents adjust more easily, form stronger social connections, and experience less behavioral disturbance when they move before the disease progresses too far. The families who tell us they wish they had moved sooner are more common than those who feel they moved too early. ELT can help you assess where your loved one is in that window. The communities that perform best on the criteria that matter — dementia programming quality, physical environment design, staffing consistency, and safety record — are not always the ones families find first. ELT evaluates all of these before any community is suggested to a family, and the findings regularly change which options we recommend.',
    secondaryPathway:
      'Also worth exploring — Assisted Living with Memory Support: Some assisted living communities offer a dedicated memory support wing rather than a standalone memory care unit. For earlier-stage cognitive impairment, this is worth a closer look — offering a less restrictive environment while still providing specialized staff and programming.',
  },

  'independent-living-hca': {
    fullDescription:
      'Independent living communities are residential neighborhoods designed for older adults who are largely self-sufficient but want the benefits of community living — social connection, amenities, activities, and the peace of mind of having neighbors and staff nearby. When paired with a scheduled home care agency, this option can provide meaningful daily support while preserving independence and a sense of normal life.',
    whyThisFits:
      'Based on what you shared, your loved one appears cognitively intact and relatively independent physically, but may benefit from more social engagement and the added security of a community setting. Pairing independent living with professional home care visits is worth exploring — the right fit depends heavily on your loved one\'s specific needs, which is exactly what a conversation with ELT helps clarify.',
    anticipationBullets: [
      'Independent living communities vary significantly in culture, activity programming, and the degree to which they welcome outside home care agencies onto the property. ELT knows which local communities are genuinely supportive of this arrangement and which ones create friction that families do not anticipate.',
      'The home care agency you pair with this arrangement matters as much as the community itself. ELT has direct experience with agencies in this area and knows the questions that reveal how they actually perform — before a family commits.',
      'Pricing for this combination can actually be more predictable long-term than assisted living, where care level add-ons can escalate significantly. ELT walks families through a side-by-side cost comparison before any decision is made.',
    ],
    whatFamiliesDontKnow:
      'Most families discover independent living by accident — usually after assuming their only options were home care or assisted living. Independent living communities generally do not provide personal care directly, but most allow vetted outside agencies to come in on a scheduled basis. This gives families flexibility to scale care up or down as needs change without triggering a community-driven care level increase. It is one of the most underutilized options in senior living — and one ELT recommends more often than most families expect. Not all independent living communities are equally welcoming of outside home care agencies — some create scheduling friction, require agency vetting processes, or have policies that limit access in ways families do not discover until after they have moved in. ELT knows which local communities make this arrangement genuinely workable before a family commits.',
    secondaryPathway:
      'Also worth exploring — Assisted Living: If your loved one\'s care needs are more significant than independent living can accommodate even with home care support, assisted living provides a higher level of integrated daily assistance with 24-hour staff availability built into the community itself.',
  },

  'home-hca': {
    fullDescription:
      'Professional home care allows your loved one to remain in a familiar home environment while receiving scheduled visits from a trained caregiver. Depending on the level of need, this can range from a few hours of assistance several days a week to daily support with bathing, dressing, meals, medication reminders, and companionship. It is often the bridge that makes staying home safely possible — at least for a meaningful period of time.',
    whyThisFits:
      'Based on what you shared, returning home with structured professional support appears to be a realistic option. There appears to be enough caregiver presence and home viability to make this work — but the level and consistency of outside support will be an important factor in whether it remains sustainable over time.',
    anticipationBullets: [
      'Home care agencies vary significantly in caregiver consistency, scheduling reliability, and how they handle callouts — the factors that determine whether a home care arrangement actually works. ELT knows which agencies in your area perform well and which ones overpromise.',
      'Minimum hour requirements, scheduling reliability, and caregiver continuity vary significantly between agencies and are rarely disclosed upfront. ELT knows which questions to ask before a family commits.',
      'The right agency for your loved one\'s specific needs is not always the largest or most advertised one. ELT matches families to agencies based on care needs, personality fit, and scheduling requirements — not just availability.',
    ],
    whatFamiliesDontKnow:
      'Most home care agencies require a minimum of three to four hours per visit, and many have minimum weekly hour commitments. Families who need less than that often find themselves paying for time they do not use — or discovering the agency will not take the case at all. There is also significant variation in how agencies handle caregiver callouts, which is one of the most common points of failure in home care arrangements. ELT helps families understand the full picture before making a commitment — and stays available as the situation evolves. The first 30 days after a skilled nursing discharge are the highest-risk period for a home care arrangement — caregivers call out, schedules shift, and needs turn out to be different than anticipated. Families who have identified a backup plan before that first week starts navigate it significantly better than those who have not.',
    secondaryPathway:
      'Also worth exploring — Assisted Living: If home care proves difficult to sustain — whether due to caregiver availability, escalating needs, or family capacity — assisted living provides a more integrated level of daily support without the coordination burden that home care places on families.',
  },

  'home-family': {
    fullDescription:
      'Some families are well-positioned to provide the support their loved one needs after discharge — at least in the near term. When physical function is largely intact, cognitive status is clear, the home environment is appropriate, and a capable family caregiver is genuinely available, returning home with family support can be a meaningful and realistic option. ELT can connect families in this situation with local resources that make home-based care more sustainable — and stays available as a trusted resource if needs change down the road.',
    whyThisFits:
      'Based on what you shared, your loved one\'s current needs appear to be manageable with family support in place. Returning home appears to be a realistic option — and ELT wants to make sure you have access to the community resources that can make that easier and help your family avoid common pitfalls that turn a workable situation into a crisis.',
    anticipationBullets: [
      'Most families underestimate how quickly caregiving demands can escalate after a skilled nursing discharge — the first 30 to 60 days at home are the highest-risk period for rehospitalization and caregiver burnout. ELT can connect you with local resources that reduce that risk before it becomes a problem.',
      'ELT can share relevant local resources — transportation services, community programs, caregiver support networks — that most families in this situation do not know exist.',
      'Family caregiving situations change — sometimes faster than anyone expects. Having ELT in your corner now means you have a trusted resource to call when the situation shifts, without starting from scratch under pressure.',
    ],
    whatFamiliesDontKnow:
      'Caregiver burnout is the leading reason that home-based care arrangements eventually break down — and it rarely announces itself clearly until a family is already in crisis. The families who navigate this most successfully are the ones who build in outside support early, before it feels necessary. ELT offers a free consultation to help families in this situation identify the right local resources — and stays available as a trusted resource if needs change down the road.',
    secondaryPathway:
      'Also worth exploring — Home with Professional Home Care: If family caregiving begins to feel stretched — whether due to scheduling, physical demands, or emotional fatigue — adding professional home care visits can meaningfully extend the sustainability of a home-based arrangement without requiring a move.',
    ctaSubtext:
      'ELT offers a free 20-minute call to help families in this situation identify the right local resources — transportation, community programs, caregiver support, and more. No placement agenda. Just a useful conversation.',
  },

  'residential-care': {
    fullDescription:
      'Residential care homes — sometimes called adult family homes or board and care homes — are small, licensed care settings that operate out of a private residence, typically serving six to eight residents at a time. They provide the same core services as assisted living — help with bathing, dressing, medications, and meals — in a quieter, more intimate environment with a higher staff-to-resident ratio than most larger communities. For the right person, the homelike setting and consistent caregivers can make a significant difference in comfort and quality of life.',
    whyThisFits:
      'Based on what you shared, your loved one may do best in a smaller, more homelike setting rather than a larger community environment. Residential care homes can offer a level of individual attention and daily consistency that is difficult for larger communities to match — and may feel like a more natural transition from home.',
    anticipationBullets: [
      'Residential care homes are largely invisible to families doing their own research — most do not advertise, do not appear on standard senior living directories, and fill primarily through professional referral networks. ELT\'s local relationships are often the only way families find out these options exist at all.',
      'Quality and character vary enormously between residential care homes. ELT can help families identify the right questions to ask and the right criteria to evaluate — and connects families with homes that have a known reputation in the local market.',
      'Availability is limited and moves quickly. The best residential care homes in any area typically have short waitlists or fill by word of mouth before a vacancy is ever publicly posted. Knowing who to call — and having an existing relationship — is what gets families access.',
    ],
    whatFamiliesDontKnow:
      'Most families have never heard of residential care homes as a category — and discover them only after a placement advisor mentions them. For the right person, they represent one of the best-kept secrets in senior care: a higher staff-to-resident ratio than most assisted living communities, a consistent and familiar daily environment, and pricing that is often lower than larger communities despite more attentive care. The challenge is finding the right one — which is exactly where ELT\'s local network makes a difference. The best residential care homes in any area fill quickly — most have no public vacancy listings and fill entirely through professional referral networks. Waiting until the situation becomes urgent is the most common reason families miss the options that would have been the best fit.',
    secondaryPathway:
      'Also worth exploring — Assisted Living: If a residential care home is not available in your area or does not feel like the right fit, assisted living communities offer a similar level of daily support in a larger setting with more amenities, social programming, and on-site services.',
  },

  'complex-medical': {
    fullDescription:
      'Based on the information you shared, your loved one\'s current care needs may exceed what assisted living, memory care, or home-based options can safely provide. This does not mean options are limited — it means the right next step requires a more careful look at what level of ongoing medical support is actually needed, and what settings can realistically provide it. ELT is not able to place into skilled nursing facilities directly, but we can help your family understand the landscape, identify questions to ask the discharge team, and connect you with the right resources for your situation.',
    whyThisFits:
      'Based on the information you shared, the level of medical complexity involved may require continued skilled nursing care or a higher level of oversight than most residential communities provide. ELT wants to make sure your family has a clear picture of what the options actually are — and a trusted resource to call when the situation evolves.',
    anticipationBullets: [
      'Navigating continued skilled nursing care involves Medicare coverage windows, benefit exhaustion timelines, and long-term care financing questions that most families are encountering for the first time under significant time pressure. ELT can help you understand what questions to ask and who to ask them.',
      'Not all skilled nursing facilities perform equally — and ELT can help your family identify the questions that reveal meaningful differences between options, even in situations where ELT is not the placing agency.',
      'Situations like this one tend to evolve — sometimes toward a higher level of care, sometimes toward a transition to a residential community as medical needs stabilize. Having ELT involved early means you have a trusted resource ready when that transition becomes relevant.',
    ],
    whatFamiliesDontKnow:
      'Many families in this situation are focused entirely on the immediate medical picture and have not yet thought about what comes next — what happens when Medicare coverage ends, what a transition to assisted living or memory care looks like from a skilled nursing facility, and how to plan for that transition before it becomes urgent. ELT offers a free 20-minute consultation to help families think through the road ahead, connect with the right local resources, and avoid the most common mistakes made during this stage of the journey.',
    secondaryPathway:
      'Also worth exploring — as medical needs stabilize: Many families in this situation eventually transition to assisted living or memory care as skilled nursing needs resolve. ELT will be ready to help when that moment comes — and starting the conversation now means you will not be making that decision under pressure.',
    ctaSubtext:
      'ELT offers a free 20-minute call to help families navigating complex care situations understand their options and connect with the right resources. No obligation — just a useful conversation with someone who knows this landscape well.',
  },
};

/** Pathways where ELT actively places families in care communities. */
export const COMMUNITY_PATHWAYS = new Set<SnfPathway>([
  'assisted-living',
  'memory-care',
  'independent-living-hca',
  'residential-care',
]);

/** Added to email report for community-based pathways after anticipation bullets. */
export const COMMUNITY_REPORT_ADDENDUM =
  'When ELT recommends communities for your loved one, every option comes with a detailed comparison report that goes well beyond what a tour reveals. Most families are surprised this level of detail exists. This is part of what ELT provides at no cost to families.';

export const CALENDAR_URL = 'https://calendar.app.google/GyPaWGMWm7TN2bodA';

export const PATHWAY_LABELS: Record<SnfPathway, string> = {
  'complex-medical':        'Complex Medical Assessment',
  'memory-care':            'Memory Care',
  'independent-living-hca': 'Independent Living with Home Care',
  'home-hca':               'Home with Professional Home Care',
  'home-family':            'Home with Family Support',
  'residential-care':       'Residential Care Home',
  'assisted-living':        'Assisted Living',
};