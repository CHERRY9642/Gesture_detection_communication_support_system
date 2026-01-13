import mediapipe as mp

print("mediapipe version:", getattr(mp, "__version__", "no __version__"))
print("has attribute 'solutions'? ->", hasattr(mp, "solutions"))
print("dir(mp) snippet:", [a for a in dir(mp) if "solutions" in a])
