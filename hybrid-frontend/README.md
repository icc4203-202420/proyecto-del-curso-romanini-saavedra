# Instrucciones de ejecución

Si se está usando WSL, hay que seguir las siguientes instrucciones antes de ejecutar el frontend:

1. En el terminal de WSL, obtener la dirección ip con el comando:
```
hostname -I
```

2. En el terminal de Windows, en modo administrador, ejecutar el siguiente comando:
```
netsh interface portproxy add v4tov4 listenport=3000 listenaddress=0.0.0.0 connectport=3000 connectaddress={ipWSL}
```

3. Obtener la dirección IPv4 de la máquina host. Ejecutar el siguiente comando en el terminal de Windows:
```
ipconfig
```
La dirección IPv4 se encuentra en:
```
Adaptador de LAN inalámbrica WI-FI:
Dirección IPv4. . . . . . . . . . . . . . : 10.33.2.22
```
O bien en:
```
Adaptador de Ethernet Ethernet:
Dirección IPv4. . . . . . . . . . . . . . : 192.168.100.3
```

4. Agregar un archivo .env en la carpeta "hybrid-frontend". En este archivo, hay que agregar lo siguiente:
```
BACKEND_URL=http://{Dirección IPv4 Windows}:3000
```

5. Para correr el backend utilizar:
```
rails s -b 0.0.0.0
```

En caso de estar usando linux/Mac, solo hay que seguir el paso 4 y 5. 
