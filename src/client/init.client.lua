--[[
Author: Thomas Schollenberger
        https://github.com/Zenthial
        tom@schollenbergers.com

Description: Client file for Toms Component System

6/27/2023
]]
local CollectionService = game:GetService("CollectionService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local tcs = require(ReplicatedStorage:WaitForChild("Shared"):WaitForChild("tcs"))


local function LoadComponent(Item)
    if not Item:IsA("ModuleScript") then
        return
    end

    if Item.Name:sub(1, 1) == "_" then
        -- Skip scripts prefixed with "_"
        return
    end

    require(Item)
end

local function LoadModule(module: ModuleScript)
    if module:IsA("ModuleScript") then
        local m = require(module)
        if typeof(m) == "table" then
            if m["Start"] ~= nil and typeof(m["Start"]) == "function" then
                task.spawn(function()
                    m:Start(tcs)
                end)
            end
        end
    end
end

local function Recurse(Root, Operator)
    for _, Item in pairs(Root:GetChildren()) do
        Operator(Item)
        Recurse(Item, Operator)
    end
end

if not game:IsLoaded() then
    game.Loaded:Wait()
end

CollectionService:AddTag(game:GetService("Workspace"), "Workspace")

local function inject(component_instance)
	-- Used in inject items into all components. A sample could be:
    --component_instance.UUID = 12345
end

tcs.set_inject_function(inject)

Recurse(script:WaitForChild("Components"), LoadComponent)
if ReplicatedStorage:FindFirstChild("Shared"):FindFirstChild("Components") then
    Recurse(ReplicatedStorage:WaitForChild("Shared"):WaitForChild("Components"), LoadComponent)
end

for _, module in pairs(script.Modules:GetChildren()) do
    LoadModule(module)
end

script.Modules.ChildAdded:Connect(LoadModule)