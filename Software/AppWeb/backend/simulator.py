import logging
import asyncio


# Simulation state variables
state = "initial"  # initial, precharging, precharged, levitating, levitated, motor_starting, cruising, motor_stopping, levitation_stopping, discharging
voltage = 0.0      # in Volts
elevation = 0.0    # in millimeters
current = 0.0      # in Amperes
velocity = 0.0     # in km/h
response = ""


async def get_packet():
    # Simulate packet generation
    global state, voltage, elevation, current, velocity
    return {
            "id": "data",
            "data": {
                "elevation": elevation,
                "velocity": velocity,
                "voltage": voltage,
                "current": current
            }
        }


async def process_command(command):
    # Simulate command processing and state changes
    global state, voltage, elevation, current, velocity, response
    if command:
        if command == "precharge":
            state = "precharging"
        elif command == "start levitation":
            state = "levitating"
        elif command == "start motor":
            state = "motor_starting"
        elif command == "stop motor":
            state = "motor_stopping"
        elif command == "stop levitation":
            state = "levitation_stopping"
        elif command == "discharge":
            state = "discharging"

    if state == "precharging":
        voltage += 10  # Increase voltage by 10 V per tick
        if voltage >= 400:
            voltage = 400
            state = "precharged"
            response = "Precharge complete. State -> precharged."
    elif state == "levitating":
        elevation += 1  # Increase elevation 1 mm per tick
        current += 1    # Increase current 1 A per tick
        if elevation >= 19 and current >= 11:
            elevation = 19
            current = 11
            state = "levitated"
            response = "Levitation complete. State -> levitated."
    elif state == "motor_starting":
        velocity += 1  # Increase velocity by 1 km/h per tick
        current = 100  # Current at 100 A during acceleration
        if velocity >= 30:
            velocity = 30
            current = 20  # Drop current to 20 A when cruising
            state = "cruising"
            response = "Motor started. State -> cruising."
    elif state == "motor_stopping":
        velocity -= 1  # Decrease velocity by 1 km/h per tick
        current = 100  # Current remains 100 A during deceleration
        if velocity <= 0:
            velocity = 0
            current = 11  # Then current returns to 11 A (levitation level)
            state = "levitated"
            response = "Motor stopped. State -> levitated."
    elif state == "levitation_stopping":
        elevation -= 1  # Decrease elevation by 1 mm per tick
        if current > 0:
            current -= 1  # Decrease current gradually to 0
        if elevation <= 0:
            elevation = 0
            current = 0
            state = "initial"
            response = "Levitation stopped. State -> initial."
    elif state == "discharging":
        voltage -= 50  # Fast discharge: drop 50 V per tick
        if voltage <= 0:
            voltage = 0
            state = "initial"
            response = "Discharge complete. State -> initial."
    else:
        response = "No command processed. State unchanged."
    
    return response