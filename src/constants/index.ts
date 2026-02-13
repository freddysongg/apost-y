import type { KeybindConfig, VADSettings, UIConfig, NoteSet } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export const DEFAULT_KEYBINDS: KeybindConfig = {
  pushToTalk: 'Space',
  toggleMute: 'KeyM',
  cancelResponse: 'Escape',
  clearConversation: 'KeyL',
  toggleOverlay: 'KeyO',
};

export const DEFAULT_VAD_SETTINGS: VADSettings = {
  threshold: 0.5,
  prefixPaddingMs: 300,
  silenceDurationMs: 500,
};

export const DEFAULT_UI_CONFIG: UIConfig = {
  fontSize: 14,
  opacity: 90,
  theme: 'dark',
};

export const SYSTEM_PROMPT_TEMPLATE = `You are an AI assistant helping a police officer during assessments and training scenarios. You have access to the officer's reference notes and should use them to provide accurate, relevant guidance.

When the officer asks about codes, procedures, or protocols, reference the provided notes to give precise answers. Be concise and direct in your responses, as the officer may be in time-sensitive situations.

{{NOTES}}

Guidelines:
- Provide clear, actionable responses
- Reference specific codes and procedures when relevant
- Keep responses brief unless asked for detailed explanations
- If unsure about a specific code or procedure, say so rather than guessing
- Prioritize officer safety in all recommendations`;

const now = Date.now();

export const DEFAULT_NOTE_SETS: NoteSet[] = [
  {
    id: uuidv4(),
    name: '10-Codes',
    content: `10-1: Unable to copy, change location
10-2: Signal good
10-3: Stop transmitting
10-4: Acknowledgment (OK)
10-5: Relay
10-6: Busy, stand by
10-7: Out of service
10-8: In service
10-9: Repeat
10-10: Fight in progress
10-11: Dog case
10-12: Stand by
10-15: Subject in custody
10-16: Pick up prisoner
10-17: Gasoline
10-20: Location
10-21: Call by phone
10-22: Disregard
10-23: Arrived at scene
10-24: Assignment completed
10-25: Report in person
10-26: Detaining subject
10-27: Drivers license information
10-28: Vehicle registration information
10-29: Check for wanted
10-30: Unnecessary use of radio
10-32: Person with gun
10-33: Emergency
10-34: Riot
10-35: Major crime alert
10-36: Correct time
10-39: Your message delivered
10-40: Silent run
10-41: Beginning tour of duty
10-42: Ending tour of duty
10-45: Animal carcass
10-50: Accident
10-51: Wrecker needed
10-52: Ambulance needed
10-53: Road blocked
10-54: Livestock on highway
10-55: Security check
10-56: Intoxicated pedestrian
10-57: Hit and run
10-58: Direct traffic
10-59: Convoy or escort
10-60: Squad in vicinity
10-61: Isolate self for message
10-62: Reply to message
10-63: Prepare to make written copy
10-64: Message for local delivery
10-65: Net message assignment
10-66: Message cancellation
10-67: Clear for net message
10-68: Dispatch information
10-69: Message received
10-70: Fire alarm
10-71: Advise nature of fire
10-72: Report progress on fire
10-73: Smoke report
10-74: Negative
10-75: In contact with
10-76: En route
10-77: ETA
10-78: Need assistance
10-79: Notify coroner
10-80: Chase in progress
10-81: Breathalyzer
10-82: Reserve lodging
10-85: Delayed due to
10-89: Bomb threat
10-90: Bank alarm
10-91: Pick up prisoner/subject
10-93: Blockade
10-94: Drag racing
10-95: Prisoner/subject in custody
10-97: Check (test) signal
10-98: Prison/jail break
10-99: Wanted/stolen indicated`,
    enabled: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: uuidv4(),
    name: 'Common Penal Codes',
    content: `PC 187 - Murder
PC 207 - Kidnapping
PC 211 - Robbery
PC 215 - Carjacking
PC 240 - Assault
PC 242 - Battery
PC 243(e)(1) - Domestic Battery
PC 245(a)(1) - Assault with Deadly Weapon
PC 261 - Rape
PC 273.5 - Corporal Injury to Spouse
PC 314 - Indecent Exposure
PC 415 - Disturbing the Peace
PC 417 - Brandishing a Weapon
PC 451 - Arson
PC 459 - Burglary
PC 470 - Forgery
PC 484 - Theft (Petty)
PC 487 - Grand Theft
PC 488 - Petty Theft
PC 496 - Receiving Stolen Property
PC 503 - Embezzlement
PC 530.5 - Identity Theft
PC 594 - Vandalism
PC 597 - Animal Cruelty
PC 602 - Trespassing
PC 646.9 - Stalking
PC 647(f) - Public Intoxication
PC 647(b) - Prostitution
PC 653m - Threatening Phone Calls
PC 12020 - Possession of Prohibited Weapon
PC 25400 - Carrying Concealed Firearm
PC 29800 - Felon in Possession of Firearm`,
    enabled: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: uuidv4(),
    name: 'Traffic Stop Procedures',
    content: `TRAFFIC STOP PROCEDURE:

1. PRE-STOP
- Observe and document violation
- Run plate through dispatch (10-28)
- Select safe location for stop
- Notify dispatch of location, vehicle description, plate number
- Activate emergency lights

2. APPROACH
- Wait for vehicle to come to complete stop
- Position patrol vehicle offset to driver side
- Exit vehicle, approach from driver side (or passenger side if safer)
- Keep hand near duty weapon
- Use spotlight/takedown lights at night
- Watch for occupant movements

3. CONTACT
- Identify yourself: "Good [morning/afternoon/evening], I'm Officer [Name] with [Department]"
- State reason for stop
- Request license, registration, and insurance
- Observe interior of vehicle (plain view doctrine)
- Note number of occupants and behavior

4. INVESTIGATION
- Return to patrol vehicle to run checks (10-27, 10-28, 10-29)
- Check for wants and warrants
- Verify license status
- Make citation/warning decision

5. CLOSURE
- Return documents
- Explain citation or warning
- Provide court date if applicable
- Thank driver for cooperation
- Ensure safe departure of violator
- Clear the stop (10-24)

SAFETY REMINDERS:
- Always maintain tactical positioning
- Never turn your back to occupants
- Watch hands at all times
- Request backup (10-78) if situation escalates
- Document everything
- Body camera should be activated before contact`,
    enabled: true,
    createdAt: now,
    updatedAt: now,
  },
];
