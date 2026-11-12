from pyzbar.pyzbar import decode
from PIL import Image

result = decode(Image.open("hello.png"))
print(result)
first_result = result[0]        # get the first (and only) QR code found
text = first_result.data.decode('utf-8')        # this is still bytes: b'hello itachi'
print(str(text))# now convert `text` to a normal string