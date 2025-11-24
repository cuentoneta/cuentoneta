<div align="center" width="100%">
    <h1>La Cuentoneta</h1>
    <picture>
        <source media="(prefers-color-scheme: dark)" srcset="https://github.com/rolivencia/cuentoneta/assets/32349705/b0ea0659-3c9d-4c4f-9d14-ab60d50dd832">
        <img width="33%" alt="La Cuentoneta" src="https://github.com/rolivencia/cuentoneta/assets/32349705/b0ea0659-3c9d-4c4f-9d14-ab60d50dd832">
    </picture>
</div>

---

# Guía de Testing
¡Te damos la bienvenida! En esta sección encontrarás cómo escribir correctamente un test plan para documentar el inicio de la fase de pruebas del desarrollo y conocer cómo trabajamos en el proyecto. Además, encontrarás fuentes útiles que te aninamos a investigar.

En caso de que desees aportar sugerencias, ya sea de mejora de este documento o propuestas, podes hacerlo desde el canal **[**#🚐 | la-cuentoneta**][dc-channel]** en Discord o en sumar un issue de tipo **[💼 Proponer mejoras en la Gestión o el Proceso de Desarrollo del Proyecto](https://github.com/cuentoneta/cuentoneta/issues/new/choose)**.

# 1. ¿Qué es un Test Plan?
Test Plan, o plan de pruebas en español, es un documento que describe estrategias, alcance, enfoque y recursos para llevar a cabo el proceso de pruebas en un proyecto de desarrollo de software o de sistemas.

# 2. Propósito
Principalmente, su objetivo es garantizar la calidad, rendimiento y buscar que dicho proyecto cumpla con los requisitos (tales como funcionalidades o el rendimiento del mismo).

### 2.1 Propósitos específicos
- Definir el alcance y objetivos de las pruebas.
- Criterios de entrada y de salida.
- Establecer un enfoque estructurado.
- Identificar recursos necesarios.
- Prever problemas y proponer estrategias para estos.
- Criterios de evaluación claros.
- Promover la comunicación y colaboración entre el equipo.

# 3. Estructura de un Test Plan
Por lo general, un Test Plan debe incluir:
- <b><u>Una introducción:</u></b> puede ser una breve descripción y objetivos del proyecto o sistema a probar.
- <b><u>Alcance del test plan:</u></b> qué funcionalidades o módulos se probarán y cuáles no.  
- <b><u>Estrategias de prueba:</u></b> incluye tipos de pruebas (unitarias, funcionales, integración, regresión, estrés, etc), herramientas a utilizar (Selenium, Jira, Postman, etc) y niveles de las pruebas.
- <b><u>Criterios de aceptación:</b></u> condiciones que deben cumplirse.
- <b><u>Casos de pruebas:</b></u> descripción y diseño de los test cases.
- <b><u>Gestión de riesgos.</b></u>
- <b><u>Recursos:</u></b> tales como las responsabilidades (QA Automation, QA Manual, QA Engineer) y la infraestructura.

# 4. Estrategias
### 4.1 Entender los requisitos del proyecto
Para esto, podemos reunirnos con las partes interesadas (desarrolladores, gerentes, Project Manager, Product Owner, etc) y analizar documentos (ya sean diagramas funcionales, de arquitectura u otros documentos relacionados). Es importante, también, priorizar las <i>funcionalidades críticas</i>.
### 4.2 Definir el alcance
- ¿Qué se probará?
- ¿Qué no se probará?
### 4.3 El enfoque de las pruebas
- <b>Identificar tipos de pruebas necesarias:</b> ya sean de integración, regresión, rendimiento, etc.
- <b>Elegir herramientas de pruebas:</b> esto puede ser en el caso de automatización (Selenium, Playwright, etc) u otras como Postman, JMeter o manuales.
### 4.4 Estructuras claras
Se pueden utilizar plantillas para dicha estructura.<br>
<i>Ejemplo:</i>
- Introducción
- Objetivos
- Alcance
- Estrategia de pruebas
- Criterios de aceptación
- Recursos
- Métricas
### 4.5 Riesgos
Puede incluir acciones en caso de retrasos o problemas técnicos.
### 4.6 Roles y responsabilidades
Esto sirve para que cada persona del equipo sepa qué tareas va a realizar y clarificar roles: QA Manual, QA Automation, Leads, etc.
# 5. Cronograma
- Fechas de inicio y fin para cada tipo de prueba.
- Revisiones del progreso.
# 6. Criterios de evaluación
- ¿Cuándo inician las pruebas, ambientes, entregables? 
- ¿Cuándo finalizan las pruebas?
# 7. Considerar la automatización
- Evaluar casos repetitivos y adecuados para ser automatizados.

# Nota:
Los test plans varian dependiendo del proyecto, ya que cada uno tiene sus propias características, objetivos, requisitos y desafíos. Aunque existe una estructura general que se suele utilizar, el contenido del mismo y enfoque cambian según las necesidades del proyecto. 

Sim embargo, tener una estructura estándar ayuda a mantener una consistencia y nos aseguramos que no se pasen por alto aspectos claves, aunque los proyectos puedan ser diferentes.

# Fuentes:
- https://www.softwaretestingbureau.com/crear-un-buenplan-de-pruebas/
- https://en.wikipedia.org/wiki/Test_plan
- https://www.guru99.com/es/test-planning.html