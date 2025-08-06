📋 INSTRUCCIONES PARA CORREGIR CAPITALIZACIÓN EN TABLA BDE

🔍 PROBLEMA IDENTIFICADO:
En home.component.scss hay reglas CSS que convierten texto a mayúsculas incorrectamente:

- "kcal/mol" se convierte a "KCAL/MOL" (incorrecto científicamente)
- Los tipos de enlace también se ponen todos en mayúsculas

🛠️ CORRECCIONES NECESARIAS:

1️⃣ BUSCAR todas las instancias de:

```css
.bde-table th {
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;  ← CAMBIAR ESTO
  letter-spacing: 0.5px;
  text-align: center;
}
```

🔄 REEMPLAZAR con:

```css
.bde-table th {
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: none;  ← CORRECCIÓN
  letter-spacing: 0.5px;
  text-align: center;
}
```

2️⃣ BUSCAR todas las instancias de:

```css
.bde-table .bond-type {
  font-size: 0.85rem;
  color: #4a5568;
  text-transform: uppercase;  ← CAMBIAR ESTO
}
```

🔄 REEMPLAZAR con:

```css
.bde-table .bond-type {
  font-size: 0.85rem;
  color: #4a5568;
  text-transform: capitalize;  ← CORRECCIÓN
}
```

📍 UBICACIONES ENCONTRADAS:

- Línea ~1213: Primera instancia de .bde-table th
- Línea ~1236: Primera instancia de .bde-table .bond-type
- Línea ~1433: Segunda instancia
- Línea ~1456: Segunda instancia
- (Hay más instancias duplicadas)

✅ RESULTADO ESPERADO:

- Los encabezados mantendrán "BDE (kcal/mol)" en lugar de "BDE (KCAL/MOL)"
- Los tipos de enlace aparecerán como "Single", "Double" en lugar de "SINGLE", "DOUBLE"
- Se preservará la nomenclatura científica correcta

💡 NOTA: El archivo parece tener secciones duplicadas, por eso hay múltiples instancias.
