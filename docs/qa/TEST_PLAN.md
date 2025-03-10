<div align="center" width="100%">
    <h1>La Cuentoneta</h1>
    <picture>
        <source media="(prefers-color-scheme: dark)" srcset="https://github.com/rolivencia/cuentoneta/assets/32349705/b0ea0659-3c9d-4c4f-9d14-ab60d50dd832">
        <img width="33%" alt="La Cuentoneta" src="https://github.com/rolivencia/cuentoneta/assets/32349705/b0ea0659-3c9d-4c4f-9d14-ab60d50dd832">
    </picture>
</div>

# 1. **Objetivo**

Este documento tiene como finalidad asegurar la calidad del sitio web de cuentos "Cuentoneta". 

# 2. **Alcance del Testing**

### Funcionalidades del sitio

- Navegación
- Visualización de los cuentos
- Secciones de comunidad
- Registro e inicio de sesión de usuarios
- Desafío de lecturas personalizadas
- Inscripción a un newsletter
- Filtros de tiempo de lectura
- Marcar historias como leídas
- Comentarios
- Puntuaciones en los cuentos
- Compatibilidad con diferentes navegadores y dispositivos móviles
- Usabilidad y experiencia del usuario

# 3. **Estrategia de Testing**

### **Testing Funcional**

- Verificación de todas las funcionalidades disponibles.

### **Testing de Usabilidad**

- Evaluaciones sobre la experiencia del usuario.

### **Testing de Compatibilidad**

- Pruebas en diversos navegadores:
    - Chrome
    - Firefox
- Dispositivos:
    - Móviles
    - Escritorios
    - Tablets

# 4. **Criterios de Aceptación**

- Los cuentos se deben mostrar de manera legible y sin errores de formato.
- Cada cuento debe incluir un título y contenido claramente visible.
- Cada cuento contará con un botón o ícono para permitir al usuario marcarlo como leído.
- Puntuación en los cuentos: se deberá realizar una sola vez, de 1 a 5 estrellas.
- El usuario podrá ingresar un tiempo disponible para leer y se le recomendará, en base a eso, un cuento.
- El usuario podrá inscribirse a un newsletter proporcionando su correo electrónico.
- La interfaz debe ser intuitiva y fácil de navegar.
- El contenido debe ser responsivo para distintos dispositivos.
- Todos los enlaces y botones deben ser funcionales y llevar al usuario a la sección correspondiente.
- Cualquier contenido multimedia (imágenes, videos) debe cargarse correctamente y ser visibles.
- No deben aparecer errores visibles (404, 500, etc.) al navegar por el sitio.
- En caso de errores técnicos, se deben mostrar mensajes amigables y comprensibles para el usuario.
- No debe haber contenido duplicado o errores gramaticales evidentes.

# 5. **Plan de Pruebas**

### **Funcionalidades a Probar**

#### **Navegación del Sitio**

- Verificar que todos los enlaces en el menú principal funcionan correctamente.
- Comprobar la navegación entre diferentes páginas de cuentos.
- Asegurarse de que haya un enlace para volver a la página principal desde cada cuento.

#### **Visualización de Cuentos**

- Validar que cada cuento se muestre correctamente con el título y el contenido completo.
- Comprobar que los elementos multimedia (imágenes, videos) se carguen y se visualicen adecuadamente.

#### **Carga de Páginas**

- Medir el tiempo de carga de la página principal y las páginas de cuentos.
- Verificar que no haya errores de carga (por ejemplo, páginas que no se abren).

#### **Interactividad**

- Confirmar que los enlaces dentro de los cuentos (si los hay) lleven a la sección o cuento correcto.
- Probar cualquier botón (como "Leer más" si existe) para asegurarse de que funcione como se espera.

#### **Compatibilidad**

- Probar la visualización del sitio en diferentes navegadores (Chrome, Firefox).
- Verificar la presentación y usabilidad en dispositivos móviles, tabletas y escritorios.

#### **Experiencia del Usuario**

- Comprobar que el diseño sea limpio y fácil de entender.
- Evaluar que los elementos de la interfaz sean accesibles y fáciles de usar.

#### **Errores y Mensajes**

- Simular situaciones que podrían generar errores y verificar que se muestren mensajes amigables (por ejemplo, enlaces rotos).
- Asegurarse de que no se muestren mensajes de error visibles durante la navegación normal.

#### **Contenido**

- Asegurar que no haya errores tipográficos ni gramaticales en los cuentos.
- Confirmar que todos los cuentos estén organizados de manera lógica y fácil de entender.

# 6. **Riesgos**

- Posibles cambios en el diseño o contenido durante el testing.
- Problemas de compatibilidad con navegadores menos comunes.

# 7. **Documentación**

- Informes de errores encontrados.
- Resultados de las pruebas.
- Documentación sobre mejoras recomendadas.