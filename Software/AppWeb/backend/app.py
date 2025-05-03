import sys
import os

# Add the backend directory to the sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import websockets
import asyncio
import json
import logging
from aiohttp import web
from backend.simulator import get_packet, process_command

TICK = 0.1  # 100 ms

# Health endpoint handler
async def health_handler(request):
    return web.json_response({"status": "ok"})

# Run an aiohttp server for health checks on port 8001
async def start_health_server():
    app = web.Application()
    app.router.add_get("/health", health_handler)
    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, "0.0.0.0", 8001)
    await site.start()
    logging.info("Health server started on http://0.0.0.0:8001/health")
    # Run indefinitely
    while True:
        await asyncio.sleep(3600)

async def websocket_handler(websocket):
    logging.info(f"New connection from {websocket.remote_address}")
    try:
        while True:
            initial_time = asyncio.get_event_loop().time()
            try:
                command = await asyncio.wait_for(websocket.recv(), timeout=TICK)
                logging.info(f"Command: {command}")
                response = await process_command(command)
            except asyncio.TimeoutError:
                logging.info("Timeout waiting for command")
                response = await process_command(json.dumps({"id": "none"}))  # No op command

            if response is None:
                logging.info("No response generated.")
            else:
                logging.info(f"Response: {response}")
                try:
                    responsePacket = {"id": "response", "data": response}
                    await websocket.send(json.dumps(responsePacket))
                except Exception as e:
                    logging.error(f"Error sending response: {e}")
                    break

            packet = await get_packet()
            try:
                await websocket.send(json.dumps(packet))
                logging.info(f"Sent packet: {packet}")
            except Exception as e:
                logging.error(f"Error sending packet: {e}")
                break

            time_to_wait = TICK - (asyncio.get_event_loop().time() - initial_time)
            if time_to_wait > 0:
                await asyncio.sleep(time_to_wait)
            
    except websockets.ConnectionClosed:
        logging.info(f"Connection closed by {websocket.remote_address}")

# Start the WebSocket server on port 8000
async def websocket_server():
    async with websockets.serve(websocket_handler, "0.0.0.0", 8000):
        logging.info("WebSocket server started on ws://0.0.0.0:8000")
        await asyncio.Future()  # Run forever

async def main():
    # Run both the health server and the WebSocket server concurrently.
    await asyncio.gather(
        start_health_server(),
        websocket_server()
    )

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(main())