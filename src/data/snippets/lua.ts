export default [
  {
    filetype: "lua",
    code: `local M = {}

local function deep_copy(tbl)
  if type(tbl) ~= "table" then
    return tbl
  end
  local copy = {}
  for k, v in pairs(tbl) do
    copy[deep_copy(k)] = deep_copy(v)
  end
  return setmetatable(copy, getmetatable(tbl))
end

function M.create_store(initial_state)
  local state = deep_copy(initial_state or {})
  local listeners = {}
  local middleware = {}

  local store = {}

  function store.get_state()
    return deep_copy(state)
  end

  function store.dispatch(action)
    local ctx = { action = action, state = state }
    local idx = 1

    local function next_middleware()
      if idx > #middleware then
        state = store.reducer(state, action)
        return
      end
      local mw = middleware[idx]
      idx = idx + 1
      mw(ctx, next_middleware)
    end

    next_middleware()

    for _, listener in ipairs(listeners) do
      listener(state, action)
    end
  end

  function store.subscribe(fn)
    table.insert(listeners, fn)
    return function()
      for i, listener in ipairs(listeners) do
        if listener == fn then
          table.remove(listeners, i)
          return
        end
      end
    end
  end

  function store.use(mw)
    table.insert(middleware, mw)
  end

  function store.reducer(current, action)
    if action.type == "SET" then
      local next_state = deep_copy(current)
      next_state[action.key] = action.value
      return next_state
    elseif action.type == "DELETE" then
      local next_state = deep_copy(current)
      next_state[action.key] = nil
      return next_state
    elseif action.type == "RESET" then
      return deep_copy(initial_state or {})
    end
    return current
  end

  return store
end

function M.logger_middleware(ctx, next)
  print(string.format("[dispatch] %s", ctx.action.type or "unknown"))
  next()
  print(string.format("[state] %d keys", #vim.tbl_keys(ctx.state)))
end

return M`,
  },
];
