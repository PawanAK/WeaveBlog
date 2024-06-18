local sqlite3 = require("lsqlite3")
local dbAdmin = require("@rakis/DbAdmin")
local db = sqlite3.open_memory()
admin = dbAdmin.new(db)
return OK

AUTHORS = [[
  CREATE TABLE IF NOT EXISTS Authors (
    PID TEXT PRIMARY KEY,
    Name TEXT
  );
]]
POSTS = [[
  CREATE TABLE IF NOT EXISTS Posts (
    ID TEXT PRIMARY KEY,
    PID TEXT,
    Title TEXT,
    Body TEXT,
    FOREIGN KEY (PID) REFERENCES Authors(PID)
  );
]]
LIKES = [[
  CREATE TABLE IF NOT EXISTS Likes (
    LID TEXT PRIMARY KEY,
    PID TEXT,
    UID TEXT,
    FOREIGN KEY (PID) REFERENCES Posts(ID),
    FOREIGN KEY (UID) REFERENCES Authors(PID)
  );
]]
COMMENTS = [[
  CREATE TABLE IF NOT EXISTS Comments (
    CID TEXT PRIMARY KEY,
    PID TEXT,
    UID TEXT,
    Comment TEXT,
    FOREIGN KEY (PID) REFERENCES Posts(ID),
    FOREIGN KEY (UID) REFERENCES Authors(PID)
  );
]]
function InitDb() 
  admin:exec(AUTHORS)
  admin:exec(POSTS)
  admin:exec(LIKES)
  admin:exec(COMMENTS)
  return admin:tables()
end

return InitDb()



Handlers.add("BlinkBlog.Register",
  function (msg)
    return msg.Action == "Register"
  end,
  function (msg)
    -- get author count to make sure author is not already registered
    local authorCount = #admin:exec(
      string.format([[select * from Authors where PID = "%s";]], msg.From)
    )
    if authorCount > 0 then
      Send({Target = msg.From, Action = "Registered", Data = "Already Registered"})
      print("Author already registered")
      return "Already Registered"
    end
    local Name = msg.Name or 'anon'
    admin:exec(string.format([[
      INSERT INTO Authors (PID, Name) VALUES ("%s", "%s");
    ]], msg.From, Name))
    Send({
      Target = msg.From,
      Action = "BlinkBlog.Registered",
      Data = "Successfully Registered."
    })
    print("Registered " .. Name)
  end 
)

Handlers.add("BlinkBlog.Post", 
  function (msg) 
    return msg.Action == "Create-Post"
  end,
  function (msg) 
    local author = admin:exec(string.format([[
      select PID, Name from Authors where PID = "%s";
    ]], msg.From))[1] 
    
    if author then
      admin:exec(string.format([[
        INSERT INTO Posts (ID, PID, Title, Body) VALUES ("%s", "%s", "%s", "%s");
      ]], msg.Id, author.PID, msg.Title, msg.Data ))
      Send({Target = msg.From, Data = "Article Posted."})
      print("New Article Posted")
      return "ok"
    else
      Send({Target = msg.From, Data = "Not Registered" })
      print("Author not registered, can't post")
    end
  end
)


Handlers.add("BlinkBlog.Posts", function (msg)
    return msg.Action == "List"
  end,
  function (msg)
    local posts = admin:exec([[
      select p.ID, p.Title, a.Name as "Author", 
      (select count(*) from Likes where PID = p.ID) as Likes,
      (select count(*) from Comments where PID = p.ID) as Comments
      from Posts p 
      LEFT OUTER JOIN Authors a ON p.PID = a.PID;
    ]])
    print("Listing " .. #posts .. " posts")
    Send({Target = msg.From, Action = "BlinkBlog.Posts", Data = require('json').encode(posts)})
  end
  )

  
  Handlers.add("BlinkBlog.Get",
function (msg) 
  return msg.Action == "Get"
end,
function (msg) 
  local post = admin:exec(string.format([[
    SELECT p.ID, p.Title, a.Name as "Author", p.Body,
    (select count(*) from Likes where PID = p.ID) as Likes,
    (select * from Comments where PID = p.ID) as Comments
    FROM Posts p 
    LEFT OUTER JOIN Authors a ON p.PID = a.PID 
    WHERE p.ID = "%s";
  ]], msg['Post-Id']))
  Send({Target = msg.From, Action = "Get-Response", Data = require('json').encode(post)})
  print(post)
end
)


Handlers.add("MicroBlog.Like",
  function (msg)
    return msg.Action == "Like"
  end,
  function (msg)
    local likeExists = #admin:exec(string.format([[
      select * from Likes where PID = "%s" and UID = "%s";
    ]], msg.PID, msg.From)) > 0
    
    if likeExists then
      Send({Target = msg.From, Action = "MicroBlog.Like", Data = "Already Liked"})
      print("Already Liked")
      return "Already Liked"
    end
    
    admin:exec(string.format([[
      INSERT INTO Likes (LID, PID, UID) VALUES ("%s", "%s", "%s");
    ]], msg.Id, msg.PID, msg.From))
    Send({Target = msg.From, Action = "MicroBlog.Liked", Data = "Successfully Liked"})
    print("Liked Microblog")
  end
)


Handlers.add("MicroBlog.Comment",
  function (msg)
    return msg.Action == "Comment"
  end,
  function (msg)
    admin:exec(string.format([[
      INSERT INTO Comments (CID, PID, UID, Comment) VALUES ("%s", "%s", "%s", "%s");
    ]], msg.Id, msg.PID, msg.From, msg.Comment))
    Send({Target = msg.From, Action = "MicroBlog.Commented", Data = "Successfully Commented"})
    print("Commented on Microblog")
  end
)


