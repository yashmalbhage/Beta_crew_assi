# BetaCrew Mock Exchange Client

## Overview

The BetaCrew Mock Exchange Client is a Node.js application that connects to the BetaCrew exchange server, requests stock ticker data, receives and processes the data, and ensures that no sequences are missing in the final JSON output.

## Prerequisites

- Node.js version 16.17.0 or higher

## Getting Started

### 1. Clone the Repository

git clone https://github.com/yashmalbhage/Beta_crew_assi.git

2. Install Dependencies
No additional dependencies are required for this project beyond Node.js.

3. Start the BetaCrew Exchange Server
Ensure that the BetaCrew exchange server is running. Download and unzip the provided server file and start it using:

node main.js


4. Run the Client Application
In a new terminal window, navigate to the project directory and run the client application:
node client.js

5. Output
The client will generate a JSON file named output.json in the project directory. This file contains an array of objects, where each object represents a packet of data with increasing sequences.