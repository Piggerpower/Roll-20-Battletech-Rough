# Roll-20-Battletech-Rough
Very rough battletech sheet and script for Roll 20

This was created for our own use and is NOT polished or made to be user friendly in any way. We are sharing it in case other may find it useful but just want to make sure it's origin. is understood.

Parts of the Roll20 That are used by the API:

  Token Bubbles
    Red: Unused in script but handy for tracking heat or VTOL elevation.
    Green: Token Attacker Mod, This value will be added to the tokens to hit number when attacking.
    Blue: Movement Mod, This value will be added to any attackers to hit number when attacking this token.
    As an example of the above, when doing a weapon check the formula is: 
    (4 + Attacking token Green bubble + Defending token Blue Bubble + Range modifier[+0/+2/+4] Depending on range bracket)
    
  MACROS
  Just some handy macros that should be created for either the GM only use or player use.
  The Format will be
  
  "Macro Name"
    "Roll20 Macro Script"
  "Macro Description"
  
  Manual-Weapon-Check
    !.c.@{selected|globalId}.@{target|globalId}.@{selected|token_name}
  With a token selected you then select a target and a weapon check is performed.
  
  Macro-Maker [IMPORTANT]
    !.m.@{selected|globalId}.@{selected|token_name}
  Creates macros for weapon hits and Weapon check on the selected token
  
  Reset-Button
    !.r
  Roll20 often has issue with token IDs across multiple pages and games so the macros bug out once in a while. Generally one  or two uses of this macro will resolve the errors and allow continued play.
    
    
  WEAPON DAMAGE
  After using macro maker each unit will have token macros for each weapon type the unit has. After doing a weapon check and finding the number of hit you only need to select the wepon that hit, then select the target hit and how many times that weapon hit.
  To clarify Cluster Weapons such as SRM or LRM weapons will cluster automatically, so if an LRM 15 hits you only need to say it hits once and the API will check how many missiles hit.
    NOTE: Not all weapons work with the script the game is designed to use 3039 tech so clan weaponry or advanced weapons that required the cluster table will need manual cluster rolls.
  When doing the damage check the script checks facing and rolls a hit location on the appropriate hit table, So if the target is facing away the API will use the back hit table automatically.
  NOTE the script DOES use a different hit table for land vehicles but only if the mechwarrior value on the token sheet is "Tank" and it does not check the side and front arc properly. API will look at the arcs always as if it's a mech, manual token turning may be needed before the weapon check to manipulate what hit table the script uses. As an addition the scirpt only has the land vehicle and mech hit tables, it does not have VTOL or infantry hit tables.
    
    
  CHARACTER SHEET
  The table at the top from Piloting / Mechwarrior to Overheat / Crew Experience, is not used by the API at all. All of these values are just for player notation.
  
  Next is the weapon list THIS IS USED HEAVILY BY THE API. 
    Qty is quantity and should denote how many of the selected weapon type are in that location.
    
  Weapon Type is the name of the weapon. The script watches for specific names here.
    LB weapons should have the name "LB []-X AC" Example is: LB 10-X AC. This causes the script to use the cluster table with single point damage groupings
    Streak Weapons need only have Streak in front of the SRM and the Macro will not use the cluster hit table and will hit as a normal weapon. This is the only weapon where you must tell the macro how many missiles hit. So you must enter 2 for the number of hits when a Streak SRM 2 hits.
    SRM or LRM weapons need only have LRM or SRM in the Weapon Type with a space on either side, LRM 15 as an example not LRM15.
    Rear facing weapons need to have (R) by itself in the weapon name and the script will acknowledge it as a rear facing weapon. "Medium Laser (R)" as an example.
  
  Location
    This one is important for checking firing arcs. Weapons in the arms will be allowed to fire into the arm arcs. A minor bug is that any weapon in the Head will be treated as if in arms. The work around is to note the location as "Center Torso Head". Arm weapons should be recorded as "[side] Arm" and torso weapons as "[side] Torso". Exaples would be "Right Arm" and "Left Torso"
  
  Heat
    Not used by any API scripting and just for player notation. Generally used to track how much heat the weapon generates per shot
  
  Dam
    The damage the weapon does per hit. For cluster weapons the damage value of each individual hit should be recorded here. LB X weapons and LRM weapons should have 1 as a Dam value while SRM weapons should have 2.
  
  Min/Short/Medium/Long
    These are the firing ranges for the weapon. This is used by the script and should be filled out exactly as on the weapon sheets. As an example Medium Laser would be 0/3/6/9 and an AC/2 would be 4/8/16/24
  
  Ammo
    Not used in any Scripting an just for player notation. As a tip we usually track a weapon types ammo only once per type. An Example would be two AC/2 weapons on a mech with only one ton of ammo. We would just put 45 in the first weapons ammo and remove 2 each time both fired.
  
    
  
  Then is the armor table.
    Each section of this table is in this format.
      [Name of section]
      A[Current Armor]/[Maximum Armor]
      I[Current Internal]/[Maximum Armor]
    None of this is used by any Scriping and is purely for player notation.
    There are two different areas in the table, The Heat Sinks area and the Back Torsos.
    The back torsos are simple, they are supposed to share internal structure with the main torsos so these areas only track armor.
    The Heat Sink Area is there to track physical heat sinks. As an exaple in our games if a mech had 10 double heat sinks we would leave the Heat Sink area as 10, but the Heat sinks area in the top table would be changed to 20 to track the actual amount of heat dissapated. Again not used by scripts and purely for player notation.
    As a reccommendation when using combat vehicles we place the front armor in the Head, the Left and Right side armor in each side torso, the Rear armor in the Center torso, and any turret armor in the Right Arm. Makes no difference but found that layout to make sense.
    
  Finally is the Internal Structure Table
    There is only one small area here used by scripting. We play by a house rule that a mech without a lower arm actuator cannot fire into it's arm arcs. So the script will check for that actuator and deny arm arcs if it is not found. To ensure it's found by the script the actuator should be filled in as "Lower Arm Actuator"
    Aside from the above this area is just for player notation and should be filled out as a normal internal diagram. It should be noted the Head area has two sections when it does not need it. The second area is used for minor notes usually to note what areas have CASE protection.
    This area is unused by vehilces. However we often use it to notate things such as the original ammo amount, engine type, and motive type.
  
    
