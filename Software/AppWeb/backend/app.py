import websockets
import asyncio
import json
import logging
from .simulator import get_packet, process_command

TICK = 0.1  # 100 ms

async def main():
    async with websockets.serve(websocket_handler, "localhost", 8765):
        logging.info("WebSocket server started on ws://localhost:8765")
        await asyncio.Future()

async def websocket_handler(websocket):
    logging.info(f"New connection from {websocket.remote_address}")
    try:
        while True:

            try:
                command = await asyncio.wait_for(websocket.recv(), timeout=TICK)
                logging.info(f"Command: {command}")
                response = await process_command(command)
                if response is None:
                    logging.info("No response generated.")
                else: 
                    logging.info(f"Response: {response}")
            except asyncio.TimeoutError:
                logging.info("Timeout waiting for command") 

            packet = await get_packet()
            try:
                await websocket.send(json.dumps(packet))
                logging.info(f"Sent packet: {packet}")
            except Exception as e:
                logging.error(f"Error sending packet: {e}")
                break

            await asyncio.sleep(TICK)  # Sleep for TICK seconds before sending the next command
            
    except websockets.ConnectionClosed:
        logging.info(f"Connection closed by {websocket.remote_address}")

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(main())