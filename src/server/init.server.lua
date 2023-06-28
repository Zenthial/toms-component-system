--[[
Author: Thomas Schollenberger
        https://github.com/Zenthial
        tom@schollenbergers.com

Description: Server file for Toms Component System

6/27/2023
]]

local CollectionService = game:GetService("CollectionService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local tcs = require(ReplicatedStorage:WaitForChild("Shared"):WaitForChild("tcs"))

------------------------------------------------------------------------
--Setup

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

local function Recurse(Root, Operator)
    for _, Item in pairs(Root:GetChildren()) do
        Operator(Item)
        Recurse(Item, Operator)
    end
end

CollectionService:AddTag(game:GetService("Workspace"), "Workspace")
CollectionService:AddTag(game:GetService("Chat"), "Chat")

local function inject(component_instance)
    -- Used in inject items into all components. A sample could be:
    --component_instance.UUID = 12345
end

tcs.set_inject_function(inject)

Recurse(script:FindFirstChild("Components"), LoadComponent)
if ReplicatedStorage:FindFirstChild("Shared"):FindFirstChild("Components") then
    Recurse(ReplicatedStorage:WaitForChild("Shared"):FindFirstChild("Components"), LoadComponent)
end

function LoadModule(module: ModuleScript)
    task.spawn(function()
        if module:IsA("ModuleScript") then
            local m = require(module)
            if typeof(m) == "table" then
                if m["Start"] ~= nil then
                    m:Start(tcs)
                end
            end
        end
    end)
end

for _, module in pairs(script.Modules:GetChildren()) do
    LoadModule(module)
end

script.Modules.ChildAdded:Connect(LoadModule)
