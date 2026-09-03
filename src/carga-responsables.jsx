import React, { useState, useMemo, useEffect, useRef } from "react";

// "Base de Tareas Pendientes (Generales)" · tareas SIN CERRAR (sin Done ni Stand by). Corte 2 ago 2026.
// t=título, r=responsables, p=proyecto, c=1 si En curso, v=fecha de vencimiento, e=esfuerzo (faltante=2).
const TASKS0 = [{"r": ["Monica Ramos"], "p": "Apropo 2026 - Ucayali", "c": 0, "v": "2026-08-04", "e": 2, "id": 0, "t": "Reporte entregable 3"}, {"r": ["Hamilin"], "p": "UNACEM · Aporta Volar · Cursos + MIA", "c": 1, "v": "2026-07-15", "e": 4, "id": 1, "t": "Seguimiento al número celular del proyecto"}, {"r": ["Enrique Garrido"], "p": "UC · Asistente IC · MIA", "c": 0, "v": "2026-07-09", "e": 4, "id": 2, "t": "Preparar el documento técnico"}, {"r": ["Hamilin"], "p": "UNACEM · Aporta Volar · Cursos + MIA", "c": 0, "v": "2026-06-19", "e": 4, "id": 3, "t": "Pruebas del cliente - Asistente"}, {"r": ["José León"], "p": "WALMART · Pedidos Perfectos Fase 2 V2 (Actualización) · Cursos y MIA", "c": 0, "v": "2026-06-19", "e": 4, "id": 4, "t": "Pase a producción nueva campaña Walmart (estimado)"}, {"r": ["José León", "Enrique Garrido"], "p": "WALMART · Pedidos Perfectos Fase 2 V2 (Actualización) · Cursos y MIA", "c": 0, "v": "2026-06-19", "e": 4, "id": 5, "t": "Agregar la Hoja MIA al reporte"}, {"r": ["Hamilin"], "p": "HELVETAS · MIDAGRI · Cursos", "c": 1, "v": "2026-07-09", "e": 3, "id": 6, "t": "Despliegue: primeros 2 cursos + soporte de Experiencia de Cliente"}, {"r": ["José León", "Franchesca Zelaya"], "p": "BELCORP · Emprendimiento · Cursos Perú", "c": 0, "v": "2026-07-21", "e": 3, "id": 7, "t": "Pase a prod 4 cursos - Perú = Colombia"}, {"r": ["Aixa Buendía"], "p": "HELVETAS · MIDAGRI · Cursos", "c": 0, "v": "2026-07-06", "e": 3, "id": 8, "t": "Realizar ajuste del cronograma"}, {"r": ["José León", "Franchesca Zelaya"], "p": "ISA · Gestores que Inspiran · Cursos y MIA", "c": 1, "v": "2026-07-16", "e": 4, "id": 9, "t": "Agregar el certificado a los cursos en producción"}, {"r": ["Hamilin"], "p": "BELCORP · Emprendimiento · Cursos Perú", "c": 0, "v": "2026-07-21", "e": 3, "id": 10, "t": "Preparar Categoría de preguntas Perú + Colombia"}, {"r": ["José León", "Franchesca Zelaya"], "p": "CADE · EVENTO · CURSO", "c": 0, "v": "2026-07-15", "e": 3, "id": 11, "t": "Pase a producción en el nuevo motor"}, {"r": ["Hamilin"], "p": "BCP · Liderazgo (Supervisores) V2 · Cursos", "c": 0, "v": "2026-08-06", "e": 2, "id": 12, "t": "Modificación del texto cuando no está registrado - soporte"}, {"r": ["Operaciones Musa", "Aixa Buendía"], "p": "UNACEM · FUNDES (PROGRESOLES) · CURSOS & MIA", "c": 0, "v": "2026-07-15", "e": 4, "id": 13, "t": "DI del primer módulo (definir # de microcursos)"}, {"r": ["Enzo Solis"], "p": "ISA · Gestores que Inspiran · Cursos y MIA", "c": 0, "v": "2026-07-14", "e": 4, "id": 14, "t": "Implementar el asistente MIA + hoja Mia al menú"}, {"r": ["Jorge Fernandez", "Hamilin"], "p": "INNOVATECH · PROGINGER · CURSOS", "c": 0, "v": "2026-07-10", "e": 2, "id": 15, "t": "Revisar la vista notificaciones de Innovatech"}, {"r": ["Hamilin", "José León"], "p": "BCP · Liderazgo (Supervisores) V2 · Cursos", "c": 0, "v": "2026-08-06", "e": 2, "id": 16, "t": "Actualización del menú supervisores y gerentes - Mantenimiento"}, {"r": ["Hamilin", "Aixa Buendía", "Julio"], "p": "BELCORP · Emprendimiento · Cursos Perú", "c": 0, "v": "2026-07-15", "e": 3, "id": 17, "t": "Pruebas UX"}, {"r": ["Hamilin", "Jaime", "Aixa Buendía"], "p": "CADE · EVENTO · CURSO", "c": 0, "v": "2026-07-17", "e": 3, "id": 18, "t": "Pruebas de UX"}, {"r": ["José León", "Enzo Solis"], "p": "ISA · Gestores que Inspiran · Cursos y MIA", "c": 0, "v": "2026-07-14", "e": 4, "id": 19, "t": "Generar el cliente + reporte en el suite Musa"}, {"r": [], "p": "ISA · Gestores que Inspiran · Cursos y MIA", "c": 0, "v": null, "e": 4, "id": 20, "t": "Pruebas UX de la ruta de aprendizaje"}, {"r": ["Hamilin"], "p": "Proyecto interno", "c": 0, "v": "2026-07-27", "e": 2, "id": 21, "t": "Revisar plantillas de correos: despliegue, cuenta, acuerdos"}, {"r": ["Hamilin"], "p": "Proyecto interno", "c": 0, "v": "2026-07-27", "e": 3, "id": 22, "t": "Estandarizar mensajes de WhatsApp y correos por etapa"}, {"r": ["Jaime", "Hamilin"], "p": "Estandarización de SOPORTE", "c": 1, "v": "2026-08-03", "e": 2, "id": 23, "t": "Estandarizar reporte de cierre para cliente"}, {"r": ["Hamilin"], "p": "Apropo 2026 - Ucayali", "c": 0, "v": "2026-07-21", "e": 2, "id": 24, "t": "Envío de 704 notificaciones en esta semana"}, {"r": ["Hamilin", "Jaime"], "p": "Estandarización de SOPORTE", "c": 1, "v": "2026-08-04", "e": 2, "id": 25, "t": "Verificar qué cambios se incluirán por ticket y WhatsApp"}, {"r": [], "p": "HELVETAS · MIDAGRI · Cursos", "c": 0, "v": null, "e": 3, "id": 26, "t": "Pase a producción"}, {"r": ["Jorge Fernandez", "José León"], "p": "CAF COL · Crianza Resp. (Unicef) · Cursos y MIA", "c": 0, "v": "2026-08-03", "e": 3, "id": 27, "t": "Desarrollo del quist por parte de tech"}, {"r": [], "p": "HELVETAS · MIDAGRI · Cursos", "c": 0, "v": null, "e": 3, "id": 28, "t": "Realizar pruebas UX + revisión de reporte"}, {"r": ["Diego Herrera"], "p": "CAF COL · Crianza Resp. (Unicef) · Cursos y MIA", "c": 0, "v": "2026-07-22", "e": 3, "id": 29, "t": "Creación de videos para la ruta"}, {"r": ["Enrique Garrido"], "p": "UC · Tutor de matemática V2 · MIA", "c": 0, "v": "2026-07-22", "e": 4, "id": 30, "t": "Reporte de uso"}, {"r": [], "p": "HELVETAS · MIDAGRI · Cursos", "c": 0, "v": "2026-08-11", "e": 3, "id": 31, "t": "Entrega final (acorde a contrato)"}, {"r": ["Julio"], "p": "HELVETAS · MIDAGRI · Cursos", "c": 0, "v": "2026-07-31", "e": 3, "id": 32, "t": "Conformidad del cliente de los módulos 2, 3 y 4"}, {"r": ["Julio", "Jaime"], "p": "UNACEM · FUNDES (PROGRESOLES) · CURSOS & MIA", "c": 0, "v": "2026-07-31", "e": 4, "id": 33, "t": "Preparar el gantt de trabajo del proyecto"}, {"r": ["Hamilin"], "p": "BELCORP · Emprendimiento · Cursos Perú", "c": 0, "v": "2026-07-21", "e": 3, "id": 34, "t": "Seguimiento del número de Colombia"}, {"r": ["José León", "Franchesca Zelaya"], "p": "BELCORP · Emprendimiento · Cursos Perú", "c": 0, "v": "2026-07-21", "e": 3, "id": 35, "t": "Pase a prod 4 cursos - Colombia = Perú"}, {"r": ["Franchesca Zelaya"], "p": "UNACEM · Aporta Volar · Cursos + MIA", "c": 1, "v": "2026-08-07", "e": 4, "id": 36, "t": "Pase a producción estimado"}, {"r": ["Hamilin", "Jaime"], "p": "UNACEM · FUNDES (PROGRESOLES) · CURSOS & MIA", "c": 0, "v": "2026-07-23", "e": 4, "id": 37, "t": "Seguimiento al cierre del alcance: microcursos + licencias + despliegue"}, {"r": ["Hamilin"], "p": "BELCORP · Emprendimiento · Cursos Perú", "c": 0, "v": "2026-07-22", "e": 3, "id": 38, "t": "Enviar correo sobre indicadores de la suite Musa"}, {"r": ["Enrique Garrido"], "p": "UC · Asistente IC · MIA", "c": 0, "v": "2026-08-13", "e": 4, "id": 39, "t": "Entregar la documentación técnica"}, {"r": ["Enrique Garrido", "Enzo Solis"], "p": "UC · Asistente IC · MIA", "c": 0, "v": "2026-07-24", "e": 4, "id": 40, "t": "Revisar estructura del asistente e informar a Assael"}, {"r": ["Hamilin"], "p": "BCP · Liderazgo (Supervisores) V2 · Cursos", "c": 0, "v": "2026-08-07", "e": 2, "id": 41, "t": "Envío de notificaciones - informar del nuevo curso"}, {"r": ["Enrique Garrido"], "p": "UC · Asistente EPG Posgrado V1 · MIA", "c": 0, "v": "2026-07-31", "e": 3, "id": 42, "t": "Ajustes del asistente + la derivación"}, {"r": ["Hamilin"], "p": "CADE · EVENTO · CURSO", "c": 0, "v": "2026-07-22", "e": 3, "id": 43, "t": "Revisar la generación de certificados para sincerar capacidad"}, {"r": ["Enrique Garrido"], "p": "ISA · Gestores que Inspiran · Cursos y MIA", "c": 0, "v": "2026-07-22", "e": 4, "id": 44, "t": "Revisar el asistente (rol Gestores PAIS del MIDIS)"}, {"r": ["Enrique Garrido"], "p": "UC · Tutor de matemática V2 · MIA", "c": 0, "v": "2026-07-27", "e": 4, "id": 45, "t": "Revisar los servidores + pruebas"}, {"r": ["Enrique Garrido"], "p": "Proyecto interno", "c": 0, "v": "2026-07-24", "e": 2, "id": 46, "t": "Conectar el simulador con el asistente de Lia soporte"}, {"r": ["Hamilin"], "p": "UNACEM · FUNDES (PROGRESOLES) · CURSOS & MIA", "c": 0, "v": "2026-07-22", "e": 4, "id": 47, "t": "Correo de seguimiento del alcance completo"}, {"r": ["Hamilin"], "p": "CAF COL · Crianza Resp. (Unicef) · Cursos y MIA", "c": 0, "v": null, "e": 3, "id": 48, "t": "Categoría de preguntas de los cursos"}, {"r": ["Julio"], "p": "CAF COL · Crianza Resp. (Unicef) · Cursos y MIA", "c": 0, "v": null, "e": 3, "id": 49, "t": "Preparar propuesta para video introductorio"}, {"r": ["Hamilin"], "p": "UNACEM · Aporta Volar · Cursos + MIA", "c": 0, "v": "2026-07-27", "e": 4, "id": 50, "t": "Hacer seguimiento por correo"}, {"r": ["Diego Herrera"], "p": "HELVETAS · MIDAGRI · Cursos", "c": 0, "v": "2026-08-12", "e": 3, "id": 51, "t": "Preparar la carpeta de viñetas en pdf y editables"}, {"r": ["Enrique Garrido"], "p": "UC · Tutor de matemática V2 · MIA", "c": 0, "v": "2026-07-31", "e": 4, "id": 52, "t": "Migración del tutor"}, {"r": ["Hamilin"], "p": "SOLIDARIDAD · Cultivate V2 · Cursos (Ampliación 3)", "c": 0, "v": "2026-07-30", "e": 3, "id": 53, "t": "Hacer seguimiento del curso 5 y curso 6"}, {"r": ["Enrique Garrido"], "p": "UC · Asistente IC · MIA", "c": 0, "v": "2026-07-31", "e": 4, "id": 54, "t": "Responder las consultas del cliente - correo"}, {"r": ["Hamilin", "Enrique Garrido"], "p": "UC · Tutor de matemática V2 · MIA", "c": 0, "v": "2026-07-27", "e": 4, "id": 55, "t": "Enviar correo al cliente sobre el inicio de pruebas"}, {"r": ["Julio"], "p": "SOLIDARIDAD · Cultivate V2 · Cursos (Ampliación 3)", "c": 1, "v": "2026-08-05", "e": 2, "id": 56, "t": "Desarrollo del curso 6 (pendiente material)"}, {"r": ["Julio"], "p": "HELVETAS · MIDAGRI · Cursos", "c": 0, "v": "2026-07-30", "e": 3, "id": 57, "t": "Revisar el feedback del cliente - correo"}, {"r": ["Julio"], "p": "CAF COL · Crianza Resp. (Unicef) · Cursos y MIA", "c": 0, "v": null, "e": 3, "id": 58, "t": "Desarrollo de una encuesta post curso"}, {"r": ["Jaime", "Enrique Garrido", "Hamilin"], "p": "Chatbot soporte MUSA · MIA", "c": 1, "v": "2026-07-28", "e": 4, "id": 59, "t": "Ajustes prueba chatbot soporte"}, {"r": ["Jaime", "Enrique Garrido"], "p": "Chatbot soporte MUSA · MIA", "c": 1, "v": "2026-08-03", "e": 4, "id": 60, "t": "Seguimiento de lanzamiento a producción"}, {"r": [], "p": null, "c": 0, "v": null, "e": 2, "id": 61, "t": "prueba 1"}, {"r": [], "p": "🛠️ PLANTILLA · Construcción de herramienta", "c": 0, "v": null, "e": 2, "id": 62, "t": "3) Desarrollo del 1er MVP"}, {"r": [], "p": "🛠️ PLANTILLA · Construcción de herramienta", "c": 0, "v": null, "e": 2, "id": 63, "t": "6) Hacer 2das pruebas"}, {"r": [], "p": "🛠️ PLANTILLA · Construcción de herramienta", "c": 0, "v": null, "e": 2, "id": 64, "t": "5) Ajuste después de pruebas"}, {"r": [], "p": "🛠️ PLANTILLA · Construcción de herramienta", "c": 0, "v": null, "e": 2, "id": 65, "t": "7) Ajuste después de pruebas"}, {"r": [], "p": null, "c": 0, "v": null, "e": 2, "id": 66, "t": "QA impacto/esfuerzo bn048n"}, {"r": [], "p": "🛠️ PLANTILLA · Construcción de herramienta", "c": 0, "v": null, "e": 2, "id": 67, "t": "4) Hacer pruebas"}, {"r": [], "p": "🛠️ PLANTILLA · Construcción de herramienta", "c": 0, "v": null, "e": 2, "id": 68, "t": "8) Lanzamiento a producción"}, {"r": [], "p": "🛠️ PLANTILLA · Construcción de herramienta", "c": 0, "v": null, "e": 2, "id": 69, "t": "1) Revisión de alcance"}, {"r": [], "p": "🛠️ PLANTILLA · Construcción de herramienta", "c": 0, "v": null, "e": 2, "id": 70, "t": "2) Planificación del proyecto"}, {"r": ["Jaime"], "p": "Estandarización de SOPORTE", "c": 0, "v": "2026-07-31", "e": 3, "id": 71, "t": "Correo de seguimiento de avance de licencias + flujo"}, {"r": ["Jaime", "Hamilin"], "p": "Estandarización de SOPORTE", "c": 1, "v": "2026-07-31", "e": 3, "id": 72, "t": "Refinar el one pager"}, {"r": ["Hamilin", "Jaime"], "p": "Estandarización de SOPORTE", "c": 0, "v": "2026-08-03", "e": 3, "id": 73, "t": "Mejorar la guía de pruebas UX"}, {"r": ["Hamilin", "Jaime"], "p": "Estandarización de SOPORTE", "c": 0, "v": "2026-08-06", "e": 4, "id": 74, "t": "Cápsulas explicativas (General, Estudiante, Curso) de onboarding"}, {"r": ["Gabriela"], "p": "Estandarización de SOPORTE", "c": 1, "v": "2026-07-31", "e": 3, "id": 75, "t": "Ajustes de las encuestas de NPS cliente"}, {"r": ["Hamilin", "Jaime"], "p": "Estandarización de SOPORTE", "c": 0, "v": "2026-08-03", "e": 2, "id": 76, "t": "Formato estándar para las pruebas de UX"}, {"r": ["Hamilin"], "p": "Proyecto interno", "c": 0, "v": "2026-08-03", "e": 2, "id": 77, "t": "Mapear la meta semanal de cada proyecto"}, {"r": [], "p": null, "c": 0, "v": null, "e": 2, "id": 78, "t": "Issue: lógica de contingencia de licencia no usada"}, {"r": ["Jorge Fernandez", "Hamilin"], "p": "SOLIDARIDAD · Cultivate V2 · Cursos", "c": 0, "v": "2026-08-04", "e": 2, "id": 79, "t": "Revisar agregar 5000 notificaciones en campaña Cultivate"}, {"r": ["Hamilin", "José León"], "p": "WALMART · Pedidos Perfectos Fase 2 V2 · Cursos", "c": 0, "v": "2026-08-03", "e": 2, "id": 80, "t": "Actualizar bienvenida + lógica de los 2 nuevos roles"}, {"r": ["Hamilin"], "p": "SOLIDARIDAD · Cultivate V2 · Cursos (Ampliación 3)", "c": 0, "v": "2026-08-19", "e": 2, "id": 81, "t": "Entrega de cursos 5 y 6"}, {"r": ["Julio"], "p": "KODEA · Programa · CURSO", "c": 0, "v": "2026-08-07", "e": 2, "id": 82, "t": "Pre-diseño de curso a alto nivel"}, {"r": ["Hamilin"], "p": "SOLIDARIDAD · Cultivate V2 · Cursos", "c": 0, "v": "2026-07-31", "e": 2, "id": 83, "t": "Agregar la lista de DNI"}, {"r": ["Franchesca Zelaya"], "p": "SOLIDARIDAD · Cultivate V2 · Cursos (Ampliación 3)", "c": 0, "v": "2026-08-17", "e": 2, "id": 84, "t": "Ajustes de pruebas UX y BD"}, {"r": ["Hamilin", "Jaime", "Julio"], "p": "SOLIDARIDAD · Cultivate V2 · Cursos (Ampliación 3)", "c": 0, "v": "2026-08-13", "e": 2, "id": 85, "t": "Pruebas UX y BD"}, {"r": ["Hamilin", "Jaime", "Julio"], "p": "SOLIDARIDAD · Cultivate V2 · Cursos (Ampliación 3)", "c": 0, "v": "2026-08-18", "e": 2, "id": 86, "t": "Pruebas finales"}];
const REMOVED = ["Operaciones Musa", "Diego Herrera", "Jorge Fernandez", "Monica Ramos", "Monica"];
const TODAY = new Date().toISOString().slice(0,10);
const MES = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
const FERIADOS = new Set([
  "2026-01-01","2026-04-02","2026-04-03","2026-05-01","2026-06-07","2026-06-29",
  "2026-07-28","2026-07-29","2026-08-30","2026-10-08","2026-11-01","2026-12-08","2026-12-25",
]);

const eff = (t) => t.r.filter((n) => n && !REMOVED.some((r) => n.trim().startsWith(r)));
const REMOVED_BITACORA = REMOVED.filter((r) => r !== "Jorge Fernandez");
const effBitacora = (t) => t.r.filter((n) => n && !REMOVED_BITACORA.some((r) => n.trim().startsWith(r)));
const addDays=(iso,n)=>{const d=new Date(iso+"T00:00:00");d.setDate(d.getDate()+n);return d.toISOString().slice(0,10);};
const lbl=(iso)=>{const d=new Date(iso+"T00:00:00");return d.getDate()+" "+MES[d.getMonth()];};
const esFinde=(iso)=>{const w=new Date(iso+"T00:00:00").getDay();return w===0||w===6;};
const fdate=(iso)=>iso?lbl(iso):"—";
const mondayOf=(iso)=>{const d=new Date(iso+"T00:00:00");const dow=(d.getDay()+6)%7;return addDays(iso,-dow);};
const THIS_MONDAY=mondayOf(TODAY);
const LAST_MONDAY=addDays(THIS_MONDAY,-7);

function buildTimeScale(minD,maxD){
  const span=Math.max(1,(new Date(maxD)-new Date(minD))/86400000);
  const pos=(v)=>Math.min(100,Math.max(0,((new Date(v)-new Date(minD))/86400000/span)*100));
  const todayPos=pos(TODAY);
  const months=[];
  let cur=new Date(minD+"T00:00:00");
  cur=new Date(cur.getFullYear(),cur.getMonth(),1);
  const end=new Date(maxD+"T00:00:00");
  while(cur<=end){
    const iso=cur.toISOString().slice(0,10);
    if(iso>=minD) months.push({iso,label:MES[cur.getMonth()]+(cur.getMonth()===0?" '"+String(cur.getFullYear()).slice(2):""),pos:pos(iso>minD?iso:minD)});
    cur=new Date(cur.getFullYear(),cur.getMonth()+1,1);
  }
  const feriados=[...FERIADOS].filter((d)=>d>=minD&&d<=maxD).map((d)=>({iso:d,pos:pos(d)}));
  const days=[];
  for(let d=minD;d<=maxD;d=addDays(d,1)){
    const dow=new Date(d+"T00:00:00").getDay();
    days.push({iso:d,pos:pos(d),dom:new Date(d+"T00:00:00").getDate(),weekend:dow===0||dow===6});
  }
  return {minD,maxD,pos,todayPos,months,feriados,days};
}
function dateFromPct(scale,pct){
  const span=Math.max(1,(new Date(scale.maxD)-new Date(scale.minD))/86400000);
  const days=Math.round((Math.max(0,Math.min(100,pct))/100)*span);
  return addDays(scale.minD,days);
}
function pesoActivoEnDia(tasks,date){
  let total=0;
  for(const t of tasks){
    if(!t.v||!date) continue;
    const vi=t.vi||t.v;
    if(date>=vi&&date<=t.v) total+=t.e;
  }
  return total;
}
function pesoPorResponsableEnDia(tasks,date){
  const m={};
  for(const t of tasks){
    if(!t.v||!date) continue;
    const vi=t.vi||t.v;
    if(date<vi||date>t.v) continue;
    for(const n of eff(t)) m[n]=(m[n]||0)+t.e;
  }
  return Object.entries(m).map(([name,peso])=>({name,peso})).sort((a,b)=>b.peso-a.peso);
}
function localScale(tasks){
  const dates=[TODAY];
  tasks.forEach((t)=>{ if(t.v) dates.push(t.v); if(t.vi) dates.push(t.vi); });
  const minD=addDays(dates.reduce((m,d)=>d<m?d:m,dates[0]),-3);
  const maxD=addDays(dates.reduce((m,d)=>d>m?d:m,dates[0]),3);
  return buildTimeScale(minD,maxD);
}

function band(t){
  if(t>=14)return{key:"saturado",label:"Saturado",color:"var(--color-danger)",bg:"var(--color-danger-surface)"};
  if(t>=8)return{key:"cargado",label:"Cargado",color:"var(--color-warn)",bg:"var(--color-warn-surface)"};
  if(t>=4)return{key:"moderado",label:"Moderado",color:"var(--color-info)",bg:"var(--color-info-surface)"};
  return{key:"disponible",label:"Disponible",color:"var(--color-ok)",bg:"var(--color-ok-surface)"};
}
function cellStyle(L,cap){
  if(!L)return{bg:"#F7F6F2",fg:"#CBC9C2"};
  const r=L/cap;
  if(r<0.6)return{bg:"#DCFCE7",fg:"#166534"};
  if(r<0.9)return{bg:"#FEF3C7",fg:"#92400E"};
  if(r<=1.1)return{bg:"#FED7AA",fg:"#9A3412"};
  return{bg:"#FEE2E2",fg:"#991B1B"};
}
const ACCENT="var(--color-accent)";
const BITACORA_PALETTE=["#1D4ED8","#6D28D9","#0F766E","#B45309","#BE185D","#15803D","#4338CA","#0E7490","#854D0E","#7E22CE","#047857","#BE123C"];
function respColor(name){
  let h=0; for(let i=0;i<name.length;i++) h=(h*31+name.charCodeAt(i))>>>0;
  return BITACORA_PALETTE[h%BITACORA_PALETTE.length];
}
// Bitácora: coordinación transversal, no se listan como responsables de fila.
const BITACORA_EXCLUYE=["Jaime","Hamilin","Aixa"];
const P_SORTS={total:{label:"Tareas",get:(p)=>p.total},vencidas:{label:"Vencidas",get:(p)=>p.vencidas},curso:{label:"En curso",get:(p)=>p.curso}};
const PRESETS=[["todas","Todas"],["vencidas","Vencidas"],["p7","7 días"],["p30","30 días"],["sinfecha","Sin fecha"]];
const TABS=[["dashboard","Dashboard"],["responsable","Responsable"],["proyecto","Proyecto"],["semana","Semana"],["gantt","Gantt"],["bitacora","Bitácora"],["tickets","Tickets"]];
// Base de Tickets - Musa: niveles de criticidad (orden por severidad) y sus colores.
const TICKET_CRITS=["4. Crítico","1 - Alto","2- Medio","3 - Bajo"];
const CRIT_COLOR={"4. Crítico":"#DC2626","1 - Alto":"#EA580C","2- Medio":"#CA8A04","3 - Bajo":"#65A30D"};
// Estado Macro real del proyecto (Notion, base "🚀 Proyectos y Cursos").
const ESTADO_MACRO_ORDER=["Pre-Producción","En Desarrollo","En Revisión/QA","En despliegue","Proceso de cierre y Reporte","Cerrado","Stand By"];
const GANTT_ESTADOS_SEL=[...ESTADO_MACRO_ORDER.map((e)=>[e,e]),["__sin","Sin estado"]];
const ALL_PROY_ESTADOS=GANTT_ESTADOS_SEL.map(([k])=>k);
const DEFAULT_PROY_ESTADOS=ALL_PROY_ESTADOS.filter((k)=>k!=="Cerrado"&&k!=="Stand By");
const ESTADO_COLOR={
  "Pre-Producción":"var(--color-preprod)","En Desarrollo":"var(--color-info)","En Revisión/QA":"var(--color-warn)",
  "En despliegue":"var(--color-accent)","Proceso de cierre y Reporte":"var(--color-teal)","Cerrado":"var(--color-ok)",
  "Stand By":"var(--color-danger)","__sin":"var(--color-faint)",
};
const BACKLOG_ESTADOS=["Pre-Producción","En Desarrollo","En Revisión/QA"];
// Vista Notion "🏗️ Pipeline de Desarrollo": Estado Macro en En Desarrollo o En Revisión/QA.
const PIPELINE_DESARROLLO_ESTADOS=["En Desarrollo","En Revisión/QA"];
const esCriticoTiempo=(s)=>!!s&&s.replace(/^[^\p{L}]*/u,"").toLowerCase().startsWith("crítico");
// Indicadores sin fuente de datos conectada todavía (no hay tickets de soporte con fechas,
// ni histórico de tareas completadas por semana). Valores manuales de referencia.

function Chevron({open}){
  return (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"
    style={{transform:open?"rotate(90deg)":"none",transition:"transform .18s"}}>
    <path d="M9 6l6 6-6 6" stroke="var(--color-muted)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>);
}

function rel(v){
  if(!v) return {t:"sin fecha", c:"var(--color-muted)"};
  const d=Math.round((new Date(v+"T00:00:00")-new Date(TODAY+"T00:00:00"))/86400000);
  if(d<0) return {t:"vencida hace "+(-d)+" d", c:"var(--color-danger)"};
  if(d===0) return {t:"vence hoy", c:"#B45309"};
  return {t:"en "+d+" d", c:"var(--color-muted)"};
}
function TaskItem({t,onStatus,showProject}){
  const r=rel(t.v);
  return (
    <div className="flex items-start gap-2 py-1.5">
      <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{background:t.c?"var(--color-info)":"var(--color-neutral-dot)"}} />
      <span className="text-[14px] leading-snug text-ink-soft flex-1">
        {t.t}
        {showProject&&t.p&&<span className="block text-[13px] text-muted truncate">{t.p}</span>}
      </span>
      {onStatus&&t.pageId&&(
        <select value={t.status||""} onChange={(e)=>{if(e.target.value)onStatus(t,e.target.value);}}
          aria-label={"Cambiar status de: "+t.t}
          className="shrink-0 text-[12px] font-medium border border-border rounded-lg px-1.5 py-1 bg-white text-muted">
          <option value="" disabled>Status…</option>
          <option value="Not started">No iniciada</option>
          <option value="In progress">En curso</option>
          <option value="Done">Hecha</option>
          <option value="Stand by">Stand by</option>
        </select>
      )}
      <span className="shrink-0 text-right leading-tight">
        <span className="block text-[13px] font-mono tabular-nums text-muted">{fdate(t.v)}</span>
        <span className="block text-[12px] font-semibold" style={{color:r.c}}>{r.t}</span>
      </span>
    </div>
  );
}

function TicketItem({k}){
  const abierto=k.estado==="Abierto";
  return (
    <div className="py-2.5">
      <div className="flex items-start gap-2">
        <span className={"mt-0.5 shrink-0 px-2 py-0.5 rounded-full text-[12px] font-semibold "+(abierto?"bg-[#FEE2E2] text-[#991B1B]":"bg-[#DCFCE7] text-[#166534]")}>{k.estado||"—"}</span>
        <span className="text-[14px] leading-snug text-ink-soft flex-1">{k.t}</span>
        {k.crit&&<span className="shrink-0 text-[12px] font-semibold whitespace-nowrap" style={{color:CRIT_COLOR[k.crit]||"var(--color-muted)"}}>{k.crit}</span>}
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[12.5px] text-muted pl-1">
        {k.p&&<span className="truncate max-w-full">🚀 {k.p}</span>}
        {k.cat&&<span>{k.cat}</span>}
        {k.rtech.length>0&&<span>Tech: {k.rtech.join(", ")}</span>}
        {k.apertura&&<span className="font-mono tabular-nums">Abre {fdate(k.apertura)}{k.cierre?" · cierra "+fdate(k.cierre):""}</span>}
        {k.sla&&<span>{k.sla}</span>}
      </div>
    </div>
  );
}

export default function Panel(){
  const [data,setData]=useState(TASKS0);
  const [refreshing,setRefreshing]=useState(false);
  const [refreshErr,setRefreshErr]=useState("");
  const [updatedAt,setUpdatedAt]=useState("2 ago 2026 (instantánea)");
  const [tab,setTab]=useState("responsable");
  const [sortKey,setSortKey]=useState("total");
  const [preset,setPreset]=useState("todas");
  const [from,setFrom]=useState(""); const [to,setTo]=useState("");
  const [cap,setCap]=useState(4);
  const [metric,setMetric]=useState("peso");
  const [openP,setOpenP]=useState(null);
  const [openPr,setOpenPr]=useState(null);
  const [soloConti,setSoloConti]=useState(false);
  const [proyEstados,setProyEstados]=useState(DEFAULT_PROY_ESTADOS);
  const [licAvgWeek,setLicAvgWeek]=useState(LAST_MONDAY);
  const [finAvgWeek,setFinAvgWeek]=useState(LAST_MONDAY);
  const [openEstado,setOpenEstado]=useState(null);
  const [cell,setCell]=useState(null);
  const [ganttProj,setGanttProj]=useState("__all__");
  const [allProjects,setAllProjects]=useState([]);
  const [tickets,setTickets]=useState([]);
  const [ticketEstado,setTicketEstado]=useState("Abierto"); // filtro por defecto: abiertos
  const [ticketCrit,setTicketCrit]=useState("todas");
  const [ticketQuery,setTicketQuery]=useState("");
  const usingRange=from||to;
  const filterActive=!!(usingRange||preset!=="todas");

  const ticketsAbiertos=useMemo(()=>tickets.filter((k)=>k.estado==="Abierto").length,[tickets]);
  const ticketsFiltrados=useMemo(()=>{
    const q=ticketQuery.trim().toLowerCase();
    return tickets
      .filter((k)=>(ticketEstado==="todas"||k.estado===ticketEstado)
        &&(ticketCrit==="todas"||k.crit===ticketCrit)
        &&(!q||(k.t||"").toLowerCase().includes(q)||(k.p||"").toLowerCase().includes(q)||(k.cat||"").toLowerCase().includes(q)))
      .sort((a,b)=>{const av=a.apertura||"",bv=b.apertura||"";return av<bv?1:av>bv?-1:0;}); // más recientes primero
  },[tickets,ticketEstado,ticketCrit,ticketQuery]);

  async function refresh(){
    if(refreshing) return;
    setRefreshing(true); setRefreshErr("");
    try{
      const res=await fetch("/api/tasks");
      const body=await res.json();
      if(!res.ok) throw new Error(body.error||"error-notion");
      const arr=Array.isArray(body)?body:(body.tasks||[]);
      const clean=arr.map((t,i)=>{
        const v=t.v?String(t.v).slice(0,10):null;
        const vi=t.vi?String(t.vi).slice(0,10):v;
        return {
          r:Array.isArray(t.r)?t.r:[], p:t.p||null, c:t.c?1:0,
          v, vi, e:typeof t.e==="number"?t.e:2, id:i, t:t.t||"",
          pageId:t.pageId||null, status:t.status||(t.c?"In progress":"Not started"), pe:t.pe||null
        };
      });
      if(!clean.length) throw new Error("vacío");
      setData(clean);
      if(Array.isArray(body.projects)&&body.projects.length){
        setAllProjects(body.projects.map((p)=>({
          name:p.name, estado:p.estado||null,
          licenciasContratadas:typeof p.licenciasContratadas==="number"?p.licenciasContratadas:null,
          estudiantesRegistrados:typeof p.estudiantesRegistrados==="number"?p.estudiantesRegistrados:null,
          pctLicencia:typeof p.pctLicencia==="number"?p.pctLicencia:null,
          esMensual:p.esMensual||null,
          tiempoEstadoMacro:p.tiempoEstadoMacro||null,
          estadoRevisado:p.estadoRevisado||null,
          snapshots:Array.isArray(p.snapshots)?p.snapshots.map((s)=>({
            fecha:s.fecha?String(s.fecha).slice(0,10):null,
            nombreCampana:s.nombreCampana||null,
            estudiantesSemana:typeof s.estudiantesSemana==="number"?s.estudiantesSemana:null,
            licTiempo:typeof s.licTiempo==="number"?s.licTiempo:null,
            licenciaVsMeta:typeof s.licenciaVsMeta==="number"?s.licenciaVsMeta:null,
            estudiantesAcumulado:typeof s.estudiantesAcumulado==="number"?s.estudiantesAcumulado:null,
            pctFinAcumulado:typeof s.pctFinAcumulado==="number"?s.pctFinAcumulado:null,
            pctFinSemanal:typeof s.pctFinSemanal==="number"?s.pctFinSemanal:null,
            nps:typeof s.nps==="number"?s.nps:null,
            logroAprendizaje:typeof s.logroAprendizaje==="number"?s.logroAprendizaje:null,
            notifSemana:typeof s.notifSemana==="number"?s.notifSemana:null,
          })):[],
        })));
      }
      if(Array.isArray(body.tickets)){
        setTickets(body.tickets.map((k,i)=>({
          id:i, pageId:k.pageId||null, t:k.t||"", estado:k.estado||null, crit:k.crit||null,
          cat:k.cat||null, tipo:k.tipo||null, canal:k.canal||null, reportado:k.reportado||null,
          rtech:Array.isArray(k.rtech)?k.rtech:[], rcrea:Array.isArray(k.rcrea)?k.rcrea:[],
          creado:k.creado||null,
          apertura:k.apertura?String(k.apertura).slice(0,10):null,
          cierre:k.cierre?String(k.cierre).slice(0,10):null,
          sla:k.sla||null, slaFinal:k.slaFinal||null, p:k.p||null,
        })));
      }
      const d=new Date();
      setUpdatedAt(d.getDate()+" "+MES[d.getMonth()]+" "+d.getHours().toString().padStart(2,"0")+":"+d.getMinutes().toString().padStart(2,"0"));
    }catch(e){
      setRefreshErr("No se pudo actualizar desde Notion (revisa NOTION_TOKEN / NOTION_TAREAS_DATABASE_ID en .env). Se mantiene la instantánea.");
    }finally{ setRefreshing(false); }
  }

  async function updateStatus(t,status){
    if(!t.pageId) return;
    try{
      const res=await fetch("/api/tasks/status",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({pageId:t.pageId,status})});
      if(!res.ok) throw new Error("fail");
      setData((prev)=>status==="Done"||status==="Stand by"
        ?prev.filter((x)=>x.id!==t.id)
        :prev.map((x)=>x.id===t.id?{...x,c:status==="In progress"?1:0,status}:x));
    }catch(e){
      setRefreshErr("No se pudo actualizar el status en Notion.");
    }
  }

  const didAutoRefresh=useRef(false);
  useEffect(()=>{
    if(didAutoRefresh.current) return;
    didAutoRefresh.current=true;
    refresh();
  },[]);

  const licAvgProyectos=useMemo(()=>{
    const weekEnd=addDays(licAvgWeek,6);
    const valores=[];
    for(const p of allProjects){
      const snap=(p.snapshots||[]).find((s)=>s.fecha&&s.fecha>=licAvgWeek&&s.fecha<=weekEnd&&s.licenciaVsMeta!=null);
      if(snap) valores.push(snap.licenciaVsMeta);
    }
    const avg=valores.length?Math.round((valores.reduce((s,v)=>s+v,0)/valores.length)*10000)/100:null;
    return {avg,count:valores.length,total:allProjects.length,weekEnd};
  },[allProjects,licAvgWeek]);
  const finAvgProyectos=useMemo(()=>{
    const weekEnd=addDays(finAvgWeek,6);
    const valores=[];
    for(const p of allProjects){
      const snap=(p.snapshots||[]).find((s)=>s.fecha&&s.fecha>=finAvgWeek&&s.fecha<=weekEnd&&s.pctFinSemanal!=null);
      if(snap) valores.push(snap.pctFinSemanal);
    }
    const avg=valores.length?Math.round((valores.reduce((s,v)=>s+v,0)/valores.length)*100)/100:null;
    return {avg,count:valores.length,total:allProjects.length,weekEnd};
  },[allProjects,finAvgWeek]);

  const filtered=useMemo(()=>data.filter((t)=>{
    if(usingRange){ if(!t.v)return false; if(from&&t.v<from)return false; if(to&&t.v>to)return false; return true; }
    switch(preset){
      case "vencidas": return t.v&&t.v<TODAY;
      case "p7": return t.v&&t.v>=TODAY&&t.v<=addDays(TODAY,7);
      case "p30": return t.v&&t.v>=TODAY&&t.v<=addDays(TODAY,30);
      case "sinfecha": return !t.v;
      default: return true;
    }
  }),[data,preset,from,to,usingRange]);

  const {people,projects,sinResp,sinProj,disponibles}=useMemo(()=>{
    const pm={},prm={}; let sinResp=0,sinProj=0;
    for(const t of filtered){
      const overdue=t.v&&t.v<TODAY?1:0;
      if(t.r.length===0) sinResp++;
      for(const n of eff(t)){
        const a=(pm[n]=pm[n]||{name:n,total:0,curso:0,vencidas:0,tasks:[]});
        a.total++; a.curso+=t.c; a.vencidas+=overdue; a.tasks.push(t);
      }
      if(!t.p) sinProj++;
      const key=t.p||"__none__";
      const b=(prm[key]=prm[key]||{name:t.p||"Sin proyecto",total:0,curso:0,vencidas:0,tasks:[]});
      b.total++; b.curso+=t.c; b.vencidas+=overdue; b.tasks.push(t);
    }
    const people=Object.values(pm);
    const projects=Object.values(prm).filter((x)=>x.name!=="Sin proyecto").sort((a,b)=>b.total-a.total);
    const disponibles=people.filter((p)=>["disponible","moderado"].includes(band(p.total).key)).sort((a,b)=>a.total-b.total);
    return {people,projects,sinResp,sinProj,disponibles};
  },[filtered]);

  const peopleSorted=useMemo(()=>[...people].sort((a,b)=>P_SORTS[sortKey].get(b)-P_SORTS[sortKey].get(a)),[people,sortKey]);

  const isConti=(name)=>/\bUC\b/i.test(name);

  const projectsFull=useMemo(()=>{
    const byName={};
    for(const p of projects) byName[p.name]={...p,estado:null,sinTareasActivas:false};
    if(allProjects.length){
      for(const p of allProjects){
        if(byName[p.name]) byName[p.name].estado=p.estado||"__sin";
        else byName[p.name]={name:p.name,total:0,curso:0,vencidas:0,tasks:[],estado:p.estado||"__sin",sinTareasActivas:true};
      }
    }
    return Object.values(byName).sort((a,b)=>b.total-a.total||a.name.localeCompare(b.name));
  },[projects,allProjects]);
  const MAXT=Math.max(1,...people.map((p)=>p.total));
  const MAXP=Math.max(1,...projects.map((p)=>p.total));

  const heat=useMemo(()=>{
    const map={};
    // maxD: la rejilla llega hasta fin de año o hasta el vencimiento más lejano.
    const finDeAno=TODAY.slice(0,4)+"-12-31";
    let maxD=finDeAno;
    for(const t of data){ if(t.v&&t.v>=TODAY&&t.v>maxD) maxD=t.v; }
    const days=[]; for(let d=TODAY;d<=maxD;d=addDays(d,1))days.push(d);
    for(const t of data) for(const n of eff(t)){
      const p=(map[n]=map[n]||{name:n,venc:0,sinfecha:0,futOnce:0,byDay:{},cells:{}});
      if(!t.v){p.sinfecha+=t.e;(p.cells.sinfecha=p.cells.sinfecha||[]).push(t);continue;}
      if(t.v<TODAY){p.venc+=t.e;(p.cells.venc=p.cells.venc||[]).push(t);continue;}
      // Activa de inicio a fin: el esfuerzo completo cuenta en CADA día del rango
      // visible (carga concurrente), no solo el día de vencimiento.
      p.futOnce+=t.e; // para ordenar filas: cada tarea una sola vez
      const vi=t.vi||t.v; const start=vi>TODAY?vi:TODAY;
      for(let d=start;d<=t.v;d=addDays(d,1)){
        p.byDay[d]=(p.byDay[d]||0)+t.e;
        (p.cells[d]=p.cells[d]||[]).push(t);
      }
    }
    const rows=Object.values(map)
      .map((p)=>({...p,activo:p.venc+p.futOnce}))
      .sort((a,b)=>b.activo-a.activo);
    return {rows,days};
  },[data]);

  const {backlogOperativo,estadoBreakdown,usingAllProjects}=useMemo(()=>{
    const buildBreakdown=(counts,names)=>[...ESTADO_MACRO_ORDER,"__sin"]
      .map((k)=>({key:k,label:k==="__sin"?"Sin estado":k,total:counts[k]||0,projects:(names[k]||[]).sort()}))
      .filter((r)=>r.total>0);

    if(allProjects.length){
      const counts={}; const names={};
      for(const p of allProjects){
        const estado=p.estado||"__sin";
        counts[estado]=(counts[estado]||0)+1;
        (names[estado]=names[estado]||[]).push(p.name);
      }
      let count=0;
      for(const k of BACKLOG_ESTADOS) count+=counts[k]||0;
      return {backlogOperativo:count,estadoBreakdown:buildBreakdown(counts,names),usingAllProjects:true};
    }

    // Fallback antes de que cargue /api/tasks: deriva proyectos solo de tareas activas (subestima el total real).
    const byProj={};
    for(const t of filtered){
      if(!t.p) continue;
      (byProj[t.p]=byProj[t.p]||[]).push(t);
    }
    let count=0;
    const counts={}; const names={};
    for(const name in byProj){
      const estado=byProj[name].find((x)=>x.pe)?.pe||"__sin";
      counts[estado]=(counts[estado]||0)+1;
      (names[estado]=names[estado]||[]).push(name);
      if(estado!=="__sin"&&BACKLOG_ESTADOS.includes(estado)) count++;
    }
    return {backlogOperativo:count,estadoBreakdown:buildBreakdown(counts,names),usingAllProjects:false};
  },[allProjects,filtered]);

  const demorados=useMemo(()=>{
    const pipeline=allProjects.filter((p)=>PIPELINE_DESARROLLO_ESTADOS.includes(p.estado));
    if(!pipeline.length) return {pct:0,count:0,total:0};
    const count=pipeline.filter((p)=>esCriticoTiempo(p.tiempoEstadoMacro)&&p.estadoRevisado==="Demorado").length;
    return {pct:((count/pipeline.length)*100).toFixed(2),count,total:pipeline.length};
  },[allProjects]);

  const clearRange=()=>{setFrom("");setTo("");};

  // Tablist: flechas para moverse entre pestañas + Home/End, con tabindex móvil.
  // Mismo patrón que onRowKeys (líneas abajo): sin librerías, foco explícito.
  const tabsRef=useRef({});
  const selectTab=(k)=>{setTab(k);setCell(null);};
  const onTabKeys=(e,idx)=>{
    const step={ArrowRight:1,ArrowLeft:-1}[e.key];
    let next=null;
    if(step!==undefined) next=(idx+step+TABS.length)%TABS.length;
    else if(e.key==="Home") next=0;
    else if(e.key==="End") next=TABS.length-1;
    else return;
    e.preventDefault();
    const k=TABS[next][0];
    selectTab(k);
    tabsRef.current[k]?.focus();
  };
  const selCell=cell?heat.rows.find((r)=>r.name===cell.n)?.cells[cell.k]||[]:[];
  const cval=(p,k)=>metric==="peso"
    ?(k==="venc"?p.venc:k==="sinfecha"?p.sinfecha:(p.byDay[k]||0))
    :((p.cells[k]||[]).length);

  // ---- Gantt: línea de tiempo por proyecto ----
  const gantt=useMemo(()=>{
    const withDate=data.filter((t)=>t.v&&t.p);
    const minD=withDate.reduce((m,t)=>t.v<m?t.v:m,TODAY);
    const maxD=withDate.reduce((m,t)=>t.v>m?t.v:m,TODAY);
    const span=Math.max(1,(new Date(maxD)-new Date(minD))/86400000);
    const pos=(v)=>Math.min(100,Math.max(0,((new Date(v)-new Date(minD))/86400000/span)*100));
    const todayPos=pos(TODAY);
    const byProj={};
    for(const t of data){
      if(!t.p) continue;
      (byProj[t.p]=byProj[t.p]||[]).push(t);
    }
    const projects=Object.entries(byProj).map(([name,tasks])=>{
      const withD=tasks.filter((t)=>t.v);
      const earliest=withD.length?withD.reduce((m,t)=>t.v<m?t.v:m,withD[0].v):null;
      const sorted=[...tasks].sort((a,b)=>(a.v||"9999")<(b.v||"9999")?-1:1);
      const overdue=tasks.filter((t)=>t.v&&t.v<TODAY).length;
      const enCurso=tasks.filter((t)=>t.c).length;
      const estado=tasks.find((t)=>t.pe)?.pe||"__sin";
      const rm={};
      for(const t of tasks){
        const over=t.v&&t.v<TODAY?1:0;
        for(const n of eff(t)){
          const a=(rm[n]=rm[n]||{name:n,total:0,curso:0,vencidas:0,sinfecha:0,tasks:[]});
          a.total++; a.curso+=t.c; a.vencidas+=over;
          if(!t.v) a.sinfecha++;
          a.tasks.push(t);
        }
      }
      const responsableStats=Object.values(rm).sort((a,b)=>b.total-a.total);
      const responsables=responsableStats.map((r)=>r.name);
      return {name,tasks:sorted,earliest,overdue,enCurso,total:tasks.length,estado,responsables,responsableStats};
    }).sort((a,b)=>(a.earliest||"9999")<(b.earliest||"9999")?-1:1);
    // marcas de mes para el eje de tiempo
    const months=[];
    let cur=new Date(minD+"T00:00:00");
    cur=new Date(cur.getFullYear(),cur.getMonth(),1);
    const end=new Date(maxD+"T00:00:00");
    while(cur<=end){
      const iso=cur.toISOString().slice(0,10);
      if(iso>=minD) months.push({iso,label:MES[cur.getMonth()],pos:pos(iso>minD?iso:minD)});
      cur=new Date(cur.getFullYear(),cur.getMonth()+1,1);
    }
    // feriados dentro del rango visible
    const feriados=[...FERIADOS].filter((d)=>d>=minD&&d<=maxD).map((d)=>({iso:d,pos:pos(d)}));
    return {projects,minD,maxD,pos,todayPos,months,feriados};
  },[data]);
  const [collapsedProj,setCollapsedProj]=useState(()=>new Set());
  const toggleCollapse=(name)=>setCollapsedProj((s)=>{const n=new Set(s);n.has(name)?n.delete(name):n.add(name);return n;});
  const [ganttEstados,setGanttEstados]=useState([]);
  const toggleGanttEstado=(k)=>setGanttEstados((s)=>s.includes(k)?s.filter((x)=>x!==k):[...s,k]);
  const toggleProyEstado=(k)=>setProyEstados((s)=>s.includes(k)?s.filter((x)=>x!==k):[...s,k]);
  const ganttList = gantt.projects.filter((p)=>
    (ganttProj==="__all__"||p.name===ganttProj)&&(ganttEstados.length===0||ganttEstados.includes(p.estado))
  );

  const draggingRef=useRef(false);
  const [ganttCursor,setGanttCursor]=useState(null);
  const pickDate=(scale,el,clientX,setFn,extra)=>{
    if(!el) return;
    const rect=el.getBoundingClientRect();
    const pct=((clientX-rect.left)/rect.width)*100;
    setFn({...extra,date:dateFromPct(scale,pct)});
  };

  // ---- Bitácora: cajas (proyecto o responsable) con una línea de tiempo por fila ----
  const [closedBitacora,setClosedBitacora]=useState(()=>new Set());
  const toggleOpenBitacora=(key)=>setClosedBitacora((s)=>{const n=new Set(s);n.has(key)?n.delete(key):n.add(key);return n;});
  const [bitacoraEstados,setBitacoraEstados]=useState([]);
  const toggleBitacoraEstado=(k)=>setBitacoraEstados((s)=>s.includes(k)?s.filter((x)=>x!==k):[...s,k]);
  const [bitacoraVista,setBitacoraVista]=useState("proyecto");
  const [bitacoraQuery,setBitacoraQuery]=useState("");
  const [bitacoraSort,setBitacoraSort]=useState("vencidas");
  const [bitacoraGroup,setBitacoraGroup]=useState(true);
  const bitacoraList=useMemo(()=>gantt.projects
    .map((p)=>{
      const rm={};
      for(const t of p.tasks){
        for(const n of effBitacora(t)){
          if(BITACORA_EXCLUYE.some((ex)=>n.trim().startsWith(ex))) continue;
          (rm[n]=rm[n]||{name:n,tasks:[]}).tasks.push(t);
        }
      }
      const respStats=Object.values(rm).sort((a,b)=>b.tasks.length-a.tasks.length);
      return {...p,respStats};
    })
    .filter((p)=>p.respStats.length>0),[gantt.projects]);
  const bitacoraFiltered=bitacoraList.filter((p)=>bitacoraEstados.length===0||bitacoraEstados.includes(p.estado));
  const bitacoraPorResponsable=useMemo(()=>{
    const rm={};
    for(const proj of bitacoraFiltered){
      for(const r of proj.respStats){
        const a=(rm[r.name]=rm[r.name]||{name:r.name,tasks:[]});
        for(const t of r.tasks) a.tasks.push({...t,__proyecto:proj.name});
      }
    }
    return Object.values(rm);
  },[bitacoraFiltered]);

  // Ambas vistas se normalizan a la misma forma: caja → filas → tareas (con color y contexto ya resueltos).
  const bitacoraBoxes=useMemo(()=>{
    const mkRow=(key,label,color,tasks,ctxKey)=>{
      const ts=tasks.map((t)=>({...t,
        __color:color||respColor(t.__proyecto||label),
        __ctx:(ctxKey&&t[ctxKey])||label,
        __rowKey:key}));
      return {key,label,color,tasks:ts,
        total:ts.length,
        vencidas:ts.filter((t)=>t.v&&t.v<TODAY).length,
        sinfecha:ts.filter((t)=>!t.v).length};
    };
    let boxes;
    if(bitacoraVista==="proyecto"){
      boxes=bitacoraFiltered.map((p)=>({
        key:"p:"+p.name, name:p.name, color:ESTADO_COLOR[p.estado],
        meta:(p.estado==="__sin"||!p.estado?"Sin estado":p.estado)+" · "+p.respStats.length+(p.respStats.length===1?" responsable":" responsables"),
        rows:p.respStats.map((r)=>mkRow(r.name,r.name,respColor(r.name),r.tasks)),
      }));
    }else{
      boxes=bitacoraPorResponsable.map((r)=>{
        const byProj={};
        for(const t of r.tasks) (byProj[t.__proyecto]=byProj[t.__proyecto]||[]).push(t);
        const projNames=Object.keys(byProj).sort((a,b)=>a.localeCompare(b));
        return {
          key:"r:"+r.name, name:r.name, color:respColor(r.name),
          meta:projNames.length+(projNames.length===1?" proyecto":" proyectos")+(bitacoraGroup?"":" en una sola línea"),
          rows:bitacoraGroup
            ?projNames.map((pn)=>mkRow(pn,pn,respColor(pn),byProj[pn]))
            :[mkRow("__all","Todas sus tareas",null,r.tasks,"__proyecto")],
        };
      });
    }
    for(const b of boxes){
      const uniq=new Map();
      for(const row of b.rows) for(const t of row.tasks) if(!uniq.has(t.id)) uniq.set(t.id,t);
      b.tasksAll=[...uniq.values()];
      b.total=b.tasksAll.length;
      b.vencidas=b.tasksAll.filter((t)=>t.v&&t.v<TODAY).length;
    }
    const q=bitacoraQuery.trim().toLowerCase();
    if(q) boxes=boxes.filter((b)=>
      b.name.toLowerCase().includes(q)||
      b.rows.some((r)=>r.label.toLowerCase().includes(q))||
      b.tasksAll.some((t)=>(t.t||"").toLowerCase().includes(q)));
    const cmp={
      vencidas:(a,b)=>b.vencidas-a.vencidas||b.total-a.total||a.name.localeCompare(b.name),
      total:(a,b)=>b.total-a.total||a.name.localeCompare(b.name),
      nombre:(a,b)=>a.name.localeCompare(b.name),
    }[bitacoraSort];
    return [...boxes].sort(cmp);
  },[bitacoraVista,bitacoraFiltered,bitacoraPorResponsable,bitacoraGroup,bitacoraQuery,bitacoraSort]);

  const bitacoraTot=useMemo(()=>{
    const uniq=new Map(); const filas=new Set();
    for(const b of bitacoraBoxes){
      for(const t of b.tasksAll) uniq.set(t.id,t);
      for(const r of b.rows) filas.add(r.label);
    }
    return {cajas:bitacoraBoxes.length, filas:filas.size,
      vencidas:[...uniq.values()].filter((t)=>t.v&&t.v<TODAY).length};
  },[bitacoraBoxes]);
  const bitacoraAllOpen=bitacoraBoxes.length>0&&bitacoraBoxes.every((b)=>!closedBitacora.has(b.key));

  return (
    <div className="min-h-screen w-full bg-canvas text-ink font-sans px-3 py-5 sm:px-6">
      <div className={tab==="bitacora"?"max-w-[100rem] mx-auto":"max-w-5xl mx-auto"}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[13px] font-semibold tracking-[0.16em] uppercase text-muted">Base de Tareas Pendientes · sin cerrar</p>
            <h1 className="mt-1 text-[26px] sm:text-3xl font-bold leading-tight tracking-tight">Carga y planificación</h1>
          </div>
          <button onClick={refresh} disabled={refreshing} aria-label={refreshing?"Actualizando datos desde Notion":"Actualizar datos desde Notion"}
            className={"shrink-0 mt-1 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[14px] font-semibold border transition-colors "+(refreshing?"bg-surface-inset text-muted border-border":"bg-white text-ink border-border active:bg-surface-sunken")}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{animation:refreshing?"spin 1s linear infinite":"none"}}>
              <path d="M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {refreshing?"Actualizando…":"Actualizar"}
          </button>
        </div>
        <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
        <p className="mt-1 text-[14.5px] text-muted">A quién asignar y para cuándo · <span role="status" className="text-muted">datos: {updatedAt}</span></p>
        {refreshErr&&<p role="alert" className="mt-2 text-[13.5px] text-[#B45309] bg-[#FEF3C7] border border-[#FDE68A] rounded-xl px-3 py-2">{refreshErr}</p>}

        {/* Tabs */}
        <h2 className="sr-only">Vistas de carga y planificación</h2>
        <div role="tablist" aria-label="Vistas de carga y planificación" className="mt-4 flex gap-1 rounded-2xl bg-surface-chip p-1 overflow-x-auto">
          {TABS.map(([k,l],i)=>(
            <button key={k} id={"tab-"+k} role="tab" aria-selected={tab===k} aria-controls={"panel-"+k}
              ref={(el)=>{tabsRef.current[k]=el;}} tabIndex={tab===k?0:-1}
              onKeyDown={(e)=>onTabKeys(e,i)} onClick={()=>selectTab(k)}
              className={"px-3.5 py-2 rounded-xl text-[14px] font-semibold whitespace-nowrap shrink-0 transition-all "+(tab===k?"bg-white text-ink shadow-sm":"text-muted")}>{l}</button>
          ))}
        </div>

        {tab==="dashboard"&&(
          <div role="tabpanel" id="panel-dashboard" aria-labelledby="tab-dashboard">
            <h2 className="sr-only">Dashboard general</h2>
            <div className="mt-4 rounded-2xl bg-white border border-border px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
              <h3 className="text-[13px] font-semibold tracking-[0.06em] uppercase text-muted">Avance de Licencias · promedio de proyectos</h3>
              <div className="mt-1.5 flex items-baseline justify-between gap-3">
                <span className="font-mono font-bold tabular-nums text-2xl" style={{color:licAvgProyectos.avg==null?"var(--color-muted)":licAvgProyectos.avg>=90?"var(--color-danger)":licAvgProyectos.avg>=60?"var(--color-warn)":"var(--color-ok)"}}>
                  {licAvgProyectos.avg==null?"—":licAvgProyectos.avg.toFixed(2)+"%"}
                </span>
                <span className="text-[13px] text-muted text-right">{licAvgProyectos.count} de {licAvgProyectos.total} proyectos con dato</span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <button onClick={()=>setLicAvgWeek((w)=>addDays(w,-7))} aria-label="Semana anterior"
                  className="shrink-0 px-2.5 py-1 rounded-full text-[13.5px] font-medium bg-surface-sunken text-muted active:bg-[#E7E5DF]">‹ Semana anterior</button>
                <span className="text-[13.5px] font-medium text-ink-soft text-center">{lbl(licAvgWeek)} – {lbl(licAvgProyectos.weekEnd)}</span>
                <button onClick={()=>setLicAvgWeek((w)=>addDays(w,7))} disabled={licAvgWeek>=LAST_MONDAY} aria-label="Semana siguiente"
                  className={"shrink-0 px-2.5 py-1 rounded-full text-[13.5px] font-medium "+(licAvgWeek>=LAST_MONDAY?"bg-[#F7F6F2] text-[#CBC9C2]":"bg-surface-sunken text-muted active:bg-[#E7E5DF]")}>Semana siguiente ›</button>
              </div>
              <p className="mt-2 text-[12.5px] leading-tight text-muted">Promedio simple de "Licencia VS meta semanal" (Snapshots Semanales de Despliegue) entre todos los proyectos con dato ese corte, semana lunes-domingo.</p>
            </div>
            <div className="mt-2.5 grid grid-cols-2 gap-2.5">
              <IndicatorCard label="Backlog" sub={usingAllProjects?"Proyectos en Pre-Prod · Desarrollo · QA (todos, activos o no)":"Proyectos en Pre-Prod · Desarrollo · QA (solo con tareas activas)"} value={backlogOperativo} valueColor="var(--color-ink)" />
              <IndicatorCard label="Proyectos demorados" sub={"Pipeline Desarrollo · "+demorados.count+" de "+demorados.total} value={demorados.pct+"%"} valueColor={demorados.pct>0?"var(--color-danger)":"var(--color-ok)"} />
            </div>

            <div className="mt-2.5 rounded-2xl bg-white border border-border px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
              <h3 className="text-[13px] font-semibold tracking-[0.06em] uppercase text-muted">Tasa de finalización · promedio de proyectos</h3>
              <div className="mt-1.5 flex items-baseline justify-between gap-3">
                <span className="font-mono font-bold tabular-nums text-2xl" style={{color:"var(--color-info)"}}>
                  {finAvgProyectos.avg==null?"—":finAvgProyectos.avg.toFixed(2)+"%"}
                </span>
                <span className="text-[13px] text-muted text-right">{finAvgProyectos.count} de {finAvgProyectos.total} proyectos con dato</span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <button onClick={()=>setFinAvgWeek((w)=>addDays(w,-7))} aria-label="Semana anterior"
                  className="shrink-0 px-2.5 py-1 rounded-full text-[13.5px] font-medium bg-surface-sunken text-muted active:bg-[#E7E5DF]">‹ Semana anterior</button>
                <span className="text-[13.5px] font-medium text-ink-soft text-center">{lbl(finAvgWeek)} – {lbl(finAvgProyectos.weekEnd)}</span>
                <button onClick={()=>setFinAvgWeek((w)=>addDays(w,7))} disabled={finAvgWeek>=LAST_MONDAY} aria-label="Semana siguiente"
                  className={"shrink-0 px-2.5 py-1 rounded-full text-[13.5px] font-medium "+(finAvgWeek>=LAST_MONDAY?"bg-[#F7F6F2] text-[#CBC9C2]":"bg-surface-sunken text-muted active:bg-[#E7E5DF]")}>Semana siguiente ›</button>
              </div>
              <p className="mt-2 text-[12.5px] leading-tight text-muted">Promedio simple de "% Finalización (semanal)" (Snapshots Semanales de Despliegue) entre todos los proyectos con dato ese corte, semana lunes-domingo.</p>
            </div>

            <div className="mt-2.5 rounded-2xl bg-white border border-border px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
              <h3 className="text-[13px] font-semibold tracking-[0.12em] uppercase text-muted">Proyectos por Estado Macro</h3>
              <p className="mt-0.5 text-[13px] text-muted">{usingAllProjects?"Universo completo de la base \"🚀 Proyectos y Cursos\" en Notion (95 proyectos, activos o no). Backlog = suma de Pre-Producción + En Desarrollo + En Revisión/QA. \"Sin estado\" son proyectos sin Estado Macro asignado en Notion.":"Backlog = suma de Pre-Producción + En Desarrollo + En Revisión/QA. \"Sin estado\" son proyectos cuya tarea no tiene la relación a la base de Proyectos y Cursos seteada en Notion."}</p>
              <div className="mt-2.5 divide-y divide-divider">
                {estadoBreakdown.map((r)=>{
                  const open=openEstado===r.key;
                  return (
                    <div key={r.key} className="py-1.5">
                      <button onClick={()=>setOpenEstado(open?null:r.key)} aria-expanded={open} className="w-full flex items-center gap-2 text-[14px] text-left">
                        <Chevron open={open}/>
                        <span className="w-2 h-2 rounded-full shrink-0" style={{background:ESTADO_COLOR[r.key]}} />
                        <span className={"flex-1 "+(BACKLOG_ESTADOS.includes(r.key)?"font-semibold text-ink":"text-muted")}>{r.label}</span>
                        <span className="font-mono font-bold tabular-nums">{r.total}</span>
                      </button>
                      {open&&(
                        <ul className="mt-1.5 ml-6 space-y-1">
                          {r.projects.map((p)=>(<li key={p} className="text-[13.5px] text-muted truncate">{p}</li>))}
                        </ul>
                      )}
                    </div>
                  );
                })}
                {estadoBreakdown.length===0&&<p className="text-[13.5px] text-muted">Sin proyectos para este filtro.</p>}
              </div>
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-muted">
              Backlog, % de proyectos demorados, Avance de Licencias y Tasa de finalización se calculan en vivo desde Notion.
            </p>
          </div>
        )}

        {(tab==="responsable"||tab==="proyecto") && (
          <div className="mt-3 rounded-2xl bg-white border border-border px-3.5 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
            <h2 className="sr-only">Filtros de fecha</h2>
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map(([k,l])=>(
                <button key={k} onClick={()=>{setPreset(k);clearRange();}}
                  className={"px-3 py-1.5 rounded-full text-[13.5px] font-medium transition-colors "+(!usingRange&&preset===k?"bg-ink text-white":"bg-surface-sunken text-muted active:bg-[#E7E5DF]")}>{l}</button>
              ))}
            </div>
            <div className="mt-2.5 flex items-center gap-2 text-[13.5px] text-muted">
              <input type="date" aria-label="Desde" value={from} onChange={(e)=>setFrom(e.target.value)} className="flex-1 min-w-0 rounded-lg border border-[#E4E2DC] px-2 py-1.5 bg-white" />
              <span>—</span>
              <input type="date" aria-label="Hasta" value={to} onChange={(e)=>setTo(e.target.value)} className="flex-1 min-w-0 rounded-lg border border-[#E4E2DC] px-2 py-1.5 bg-white" />
              {usingRange&&<button onClick={clearRange} className="text-danger font-semibold whitespace-nowrap">Limpiar</button>}
            </div>
          </div>
        )}

        {tab==="responsable"&&(
          <div role="tabpanel" id="panel-responsable" aria-labelledby="tab-responsable">
            <h2 className="sr-only">Carga por responsable</h2>
            <SummaryRow items={[{n:filtered.length,l:"Tareas"},{n:people.length,l:"Responsables"},{n:sinResp,l:"Sin asignar"}]} />
            {!filterActive&&disponibles.length>0&&(
              <div className="mt-3 rounded-2xl border border-[#CFEBD6] bg-[#EEFBF1] px-4 py-3">
                <h3 className="text-[13px] font-semibold tracking-[0.12em] uppercase text-ok">Con margen para asignar</h3>
                <p className="mt-1 text-[14.5px] text-[#256437] leading-snug">{disponibles.map((p)=>p.name).join(" · ")}</p>
              </div>
            )}
            {filterActive&&(
              <p className="mt-3 text-[13.5px] text-muted leading-snug">Vista filtrada: los números reflejan solo el filtro. La capacidad (bandas y "con margen") se evalúa sobre todas las tareas — quita el filtro para verla.</p>
            )}
            <div className="mt-4 flex items-center gap-1.5 overflow-x-auto pb-1">
              <span className="text-[13.5px] text-muted mr-0.5 shrink-0">Ordenar</span>
              {Object.entries(P_SORTS).map(([k,v])=>(
                <button key={k} onClick={()=>setSortKey(k)}
                  className={"px-2.5 py-1 rounded-full text-[13.5px] font-medium shrink-0 transition-colors "+(sortKey===k?"bg-ink text-white":"bg-white text-muted border border-border")}>{v.label}</button>
              ))}
            </div>
            <div className="mt-2.5 space-y-2">
              {peopleSorted.length===0&&<Empty/>}
              {peopleSorted.map((p)=>{
                const b=band(p.total); const pct=Math.max(4,Math.round((p.total/MAXT)*100)); const open=openP===p.name;
                const barColor=filterActive?"var(--color-faint)":b.color; const numColor=filterActive?"var(--color-ink-soft)":b.color;
                return (
                  <div key={p.name} className="rounded-2xl bg-white border border-border shadow-[0_1px_2px_rgba(0,0,0,0.03)] overflow-hidden">
                    {/* El nombre visible vive dentro del botón (que no puede contener un heading),
                        así que se expone como h3 solo para lectores de pantalla. */}
                    <h3 className="sr-only">{p.name}</h3>
                    <button onClick={()=>setOpenP(open?null:p.name)} aria-expanded={open} aria-label={(open?"Ocultar":"Ver")+" tareas de "+p.name} className="w-full text-left px-4 pt-3 pb-3 active:bg-surface-muted">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <Chevron open={open}/>
                          <span className="font-semibold truncate">{p.name}</span>
                          {!filterActive&&<span className="shrink-0 text-[12px] font-semibold px-1.5 py-0.5 rounded-full" style={{color:b.color,backgroundColor:b.bg}}>{b.label}</span>}
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-mono font-bold tabular-nums text-lg" style={{color:numColor}}>{p.total}</span>
                          <span className="text-[13px] text-muted"> tareas</span>
                        </div>
                      </div>
                      <div className="mt-2 h-2 w-full rounded-full bg-surface-track overflow-hidden">
                        <div className="h-full rounded-full" style={{width:pct+"%",backgroundColor:barColor}} />
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 text-[13.5px] text-muted">
                        <span><b className="font-semibold text-ink-soft">{p.curso}</b> en curso</span>
                        <span><b className="font-semibold text-ink-soft">{p.total-p.curso}</b> sin iniciar</span>
                        {p.vencidas>0&&<span className="ml-auto font-semibold text-danger">de ellas, {p.vencidas} vencidas</span>}
                      </div>
                    </button>
                    {open&&(
                      <div className="px-4 pb-3 pt-1 border-t border-[#F0EEE8] divide-y divide-divider">
                        {[...p.tasks].sort((a,b)=>(a.v||"9999")<(b.v||"9999")?-1:1).map((t)=><TaskItem key={t.id} t={t} onStatus={updateStatus} showProject/>)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-2 rounded-2xl border border-dashed border-border-strong bg-white px-4 py-3 flex items-baseline justify-between">
              <span className="font-semibold text-muted text-[14.5px]">Sin asignar</span>
              <span className="font-mono font-bold tabular-nums text-lg text-muted">{sinResp}</span>
            </div>
          </div>
        )}

        {tab==="proyecto"&&(
          <div role="tabpanel" id="panel-proyecto" aria-labelledby="tab-proyecto">
            <h2 className="sr-only">Carga por proyecto</h2>
            <SummaryRow items={[{n:filtered.length,l:"Tareas"},{n:projectsFull.length,l:allProjects.length?"Proyectos (Notion)":"Proyectos"},{n:sinProj,l:"Sin proyecto"}]} />
            {allProjects.length>0&&<p className="mt-2 text-[13.5px] text-muted leading-snug">Incluye los {projectsFull.length} proyectos de la base "🚀 Proyectos y Cursos" en Notion, tengan o no tareas activas pendientes.</p>}
            <div className="mt-3 flex items-center gap-1.5">
              <button onClick={()=>setSoloConti((s)=>!s)} aria-pressed={soloConti}
                className={"px-3 py-1.5 rounded-full text-[13.5px] font-medium "+(soloConti?"bg-ink text-white":"bg-surface-sunken text-muted active:bg-[#E7E5DF]")}>Conti (UC)</button>
              {soloConti&&<span className="text-[13px] text-muted">{projectsFull.filter((p)=>isConti(p.name)).length} proyectos</span>}
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="text-[13.5px] text-muted self-center mr-0.5">Estado</span>
              <button onClick={()=>setProyEstados(ALL_PROY_ESTADOS)} aria-pressed={proyEstados.length===ALL_PROY_ESTADOS.length}
                className={"px-2.5 py-1 rounded-full text-[13.5px] font-medium "+(proyEstados.length===ALL_PROY_ESTADOS.length?"bg-ink text-white":"bg-white text-muted border border-border")}>Todos</button>
              {GANTT_ESTADOS_SEL.map(([k,l])=>(
                <button key={k} onClick={()=>toggleProyEstado(k)} aria-pressed={proyEstados.includes(k)}
                  className={"inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[13.5px] font-medium "+(proyEstados.includes(k)?"bg-ink text-white":"bg-white text-muted border border-border")}>
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{background:ESTADO_COLOR[k]}} />{l}
                </button>
              ))}
              {proyEstados.length!==DEFAULT_PROY_ESTADOS.length&&<button onClick={()=>setProyEstados(DEFAULT_PROY_ESTADOS)} className="px-2.5 py-1 rounded-full text-[13.5px] font-semibold text-danger">Restablecer</button>}
            </div>
            <div className="mt-2.5 space-y-2">
              {projectsFull.filter((p)=>(!soloConti||isConti(p.name))&&proyEstados.includes(p.estado||"__sin")).length===0&&<Empty/>}
              {projectsFull.filter((p)=>(!soloConti||isConti(p.name))&&proyEstados.includes(p.estado||"__sin")).map((p)=>{
                const pct=Math.max(5,Math.round((p.total/MAXP)*100)); const open=openPr===p.name;
                const sinTareas=p.total===0;
                return (
                  <div key={p.name} className="rounded-2xl bg-white border border-border shadow-[0_1px_2px_rgba(0,0,0,0.03)] overflow-hidden">
                    <h3 className="sr-only">{p.name}</h3>
                    <button onClick={()=>!sinTareas&&setOpenPr(open?null:p.name)} disabled={sinTareas} aria-expanded={open} aria-label={(open?"Ocultar":"Ver")+" tareas de "+p.name} className={"w-full text-left px-4 py-2.5 "+(sinTareas?"cursor-default":"active:bg-surface-muted")}>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          {!sinTareas&&<Chevron open={open}/>}
                          {p.estado&&<span className="w-1.5 h-1.5 rounded-full shrink-0" style={{background:ESTADO_COLOR[p.estado]}} title={p.estado==="__sin"?"Sin estado":p.estado} />}
                          <span className={"text-[14px] font-medium truncate "+(sinTareas?"text-muted":"")}>{p.name}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-mono font-bold tabular-nums text-base" style={{color:sinTareas?"var(--color-faint)":ACCENT}}>{p.total}</span>
                          <span className="text-[13px] text-muted"> tareas</span>
                        </div>
                      </div>
                      {!sinTareas&&(
                        <div className="mt-1.5 ml-6 h-1.5 rounded-full bg-surface-track overflow-hidden">
                          <div className="h-full rounded-full" style={{width:pct+"%",backgroundColor:ACCENT}} />
                        </div>
                      )}
                      <div className="mt-2 ml-6 flex flex-wrap items-center gap-x-3 text-[13.5px] text-muted">
                        {sinTareas?(
                          <span>{filterActive?"Sin tareas en este filtro":"Sin tareas activas"}</span>
                        ):(
                          <span><b className="font-semibold text-ink-soft">{p.curso}</b> en curso · <b className="font-semibold text-ink-soft">{p.total-p.curso}</b> sin iniciar</span>
                        )}
                        {p.vencidas>0&&<span className="ml-auto font-semibold text-danger">de ellas, {p.vencidas} vencidas</span>}
                      </div>
                    </button>
                    {open&&!sinTareas&&(
                      <div className="px-4 pb-3 pt-1 border-t border-[#F0EEE8] divide-y divide-divider">
                        {[...p.tasks].sort((a,b)=>(a.v||"9999")<(b.v||"9999")?-1:1).map((t)=><TaskItem key={t.id} t={t} onStatus={updateStatus}/>)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-2 rounded-2xl border border-dashed border-border-strong bg-white px-4 py-3 flex items-baseline justify-between">
              <span className="font-semibold text-muted text-[14.5px]">Sin proyecto</span>
              <span className="font-mono font-bold tabular-nums text-lg text-muted">{sinProj}</span>
            </div>
          </div>
        )}

        {tab==="semana"&&(
          <div role="tabpanel" id="panel-semana" aria-labelledby="tab-semana">
            <h2 className="sr-only">Carga por día y persona</h2>
            <div className="mt-3 rounded-2xl bg-white border border-border px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
              <div className="flex items-center gap-2">
                <h3 className="text-[13.5px] font-medium text-muted">Mostrar en cada celda</h3>
                <div className="inline-flex rounded-xl bg-surface-inset p-0.5 ml-auto">
                  {[["peso","Peso"],["tareas","N.º tareas"]].map(([k,l])=>(
                    <button key={k} onClick={()=>{setMetric(k);setCap(k==="peso"?4:3);setCell(null);}}
                      className={"px-3 py-1 rounded-lg text-[13.5px] font-semibold transition-all "+(metric===k?"bg-white text-ink shadow-sm":"text-muted")}>{l}</button>
                  ))}
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[14.5px] font-medium">Tope de {metric==="peso"?"esfuerzo":"tareas"} por día</span>
                <span className="font-mono font-bold tabular-nums text-lg">{cap}</span>
              </div>
              <input type="range" min={metric==="peso"?2:1} max={metric==="peso"?10:6} value={cap} onChange={(e)=>{setCap(+e.target.value);setCell(null);}}
                aria-label={"Tope de "+(metric==="peso"?"esfuerzo":"tareas")+" por día"} aria-valuetext={String(cap)}
                className="mt-2 w-full accent-ink" />
              <div className="mt-1 flex items-center gap-3 text-[13px] text-muted">
                <Lg c="#DCFCE7">Margen</Lg><Lg c="#FED7AA">Al tope</Lg><Lg c="#FEE2E2">Sobrecarga</Lg>
                <span className="ml-auto inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full ring-2 ring-ok inline-block"/>1ª libre</span>
              </div>
            </div>
            <p className="mt-2.5 text-[13.5px] text-muted">Cada celda muestra {metric==="peso"?"la suma de esfuerzo (peso)":"el número de tareas"} activo ese día: cada tarea cuenta de inicio a fin, no solo el día que vence. Toca una celda para ver sus tareas.</p>
            <h3 className="sr-only">Mapa de carga por día y persona</h3>
            <div className="mt-1.5 overflow-x-auto rounded-2xl border border-border bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
              <table className="w-full border-collapse text-[14px]">
                <thead>
                  <tr className="text-muted">
                    <th className="sticky left-0 bg-white text-left font-semibold px-3 py-2.5 z-10">Persona</th>
                    <th className="px-2 py-2.5 font-medium text-center text-danger">Venc.</th>
                    {heat.days.map((d,i)=>(<th key={d} className="px-2 py-2.5 font-medium text-center whitespace-nowrap" style={esFinde(d)?{backgroundColor:"#FFEAD6"}:FERIADOS.has(d)?{backgroundColor:"#FEE2E2",color:"#991B1B"}:{backgroundColor:"var(--color-surface-sunken)"}}>{lbl(d)}{i===0&&<div className="text-[12px] font-semibold text-ok leading-none mt-0.5">hoy</div>}{FERIADOS.has(d)&&<div className="text-[12px] font-semibold text-[#991B1B] leading-none mt-0.5">feriado</div>}</th>))}
                    <th className="px-2 py-2.5 font-medium text-center text-muted">S/f</th>
                  </tr>
                </thead>
                <tbody>
                  {heat.rows.map((p)=>{
                    const freeDay=heat.days.find((d)=>cval(p,d)<cap*0.6);
                    return (
                    <tr key={p.name} className="border-t border-[#F2F0EA]">
                      <td className="sticky left-0 bg-white px-3 py-1.5 font-medium whitespace-nowrap z-10">{p.name}</td>
                      <td className="px-1.5 py-1.5"><Cell v={cval(p,"venc")} cap={Math.max(1,cap*0.5)} on={()=>setCell({n:p.name,k:"venc"})} act={cell&&cell.n===p.name&&cell.k==="venc"} label={p.name+" — vencidas"}/></td>
                      {heat.days.map((d)=>(<td key={d} className="px-1.5 py-1.5" style={esFinde(d)?{backgroundColor:"#FFF4E8"}:{backgroundColor:"var(--color-surface-muted)"}}><Cell v={cval(p,d)} cap={cap} ring={freeDay===d} on={()=>setCell({n:p.name,k:d})} act={cell&&cell.n===p.name&&cell.k===d} label={p.name+" — "+lbl(d)}/></td>))}
                      <td className="px-1.5 py-1.5"><Cell v={cval(p,"sinfecha")} cap={cap} muted on={()=>setCell({n:p.name,k:"sinfecha"})} act={cell&&cell.n===p.name&&cell.k==="sinfecha"} label={p.name+" — sin fecha"}/></td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {cell&&selCell.length>0&&(
              <div className="mt-2.5 rounded-2xl bg-white border border-border px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                <h3 className="text-[13.5px] font-semibold text-ink-soft">{cell.n} · {cell.k==="venc"?"Vencidas":cell.k==="sinfecha"?"Sin fecha":lbl(cell.k)}</h3>
                <div className="mt-1 divide-y divide-divider">{[...selCell].sort((a,b)=>(a.v||"9999")<(b.v||"9999")?-1:1).map((t)=><TaskItem key={t.id} t={t} onStatus={updateStatus} showProject/>)}</div>
              </div>
            )}
            <p className="mt-3 text-[13px] leading-relaxed text-muted">Usa el selector "Mostrar en cada celda" para alternar entre suma de esfuerzo (peso) y número de tareas. El anillo verde marca el primer día con margen de cada persona. Esfuerzo faltante contado como 2.</p>
          </div>
        )}

        {tab==="gantt"&&(
          <div role="tabpanel" id="panel-gantt" aria-labelledby="tab-gantt">
            <h2 className="sr-only">Línea de tiempo por proyecto</h2>
            <div className="mt-4 flex items-center gap-1.5">
              <div className="flex gap-1.5 overflow-x-auto pb-1 flex-1 min-w-0">
                <button onClick={()=>setGanttProj("__all__")}
                  className={"px-2.5 py-1 rounded-full text-[13.5px] font-medium shrink-0 "+(ganttProj==="__all__"?"bg-ink text-white":"bg-white text-muted border border-border")}>Todos los proyectos</button>
                {gantt.projects.map((p)=>(
                  <button key={p.name} onClick={()=>setGanttProj(p.name)}
                    className={"inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[13.5px] font-medium shrink-0 whitespace-nowrap "+(ganttProj===p.name?"bg-ink text-white":"bg-white text-muted border border-border")}>
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{background:ESTADO_COLOR[p.estado]}} />
                    {p.name}{p.overdue>0&&<span className="text-[12px] font-bold" style={{color:ganttProj===p.name?"#FCA5A5":"var(--color-danger)"}}>{p.overdue}</span>}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <span className="text-[13.5px] text-muted self-center mr-0.5">Estado</span>
              <button onClick={()=>setGanttEstados([])} aria-pressed={ganttEstados.length===0}
                className={"px-2.5 py-1 rounded-full text-[13.5px] font-medium "+(ganttEstados.length===0?"bg-ink text-white":"bg-white text-muted border border-border")}>Todas</button>
              {GANTT_ESTADOS_SEL.map(([k,l])=>(
                <button key={k} onClick={()=>toggleGanttEstado(k)} aria-pressed={ganttEstados.includes(k)}
                  className={"inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[13.5px] font-medium "+(ganttEstados.includes(k)?"bg-ink text-white":"bg-white text-muted border border-border")}>
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{background:ESTADO_COLOR[k]}} />{l}
                </button>
              ))}
              {ganttEstados.length>0&&<button onClick={()=>setGanttEstados([])} className="px-2.5 py-1 rounded-full text-[13.5px] font-semibold text-danger">Limpiar</button>}
            </div>

            <div className="mt-2 rounded-2xl bg-white border border-border px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.03)] overflow-x-auto">
              <div className="min-w-[560px]">
                <div className="relative h-5 text-[12px] text-muted font-mono">
                  {gantt.months.map((m)=>(
                    <span key={m.iso} className="absolute -translate-x-1/2 whitespace-nowrap" style={{left:m.pos+"%"}}>{m.label}</span>
                  ))}
                </div>
                <div className="relative mt-1 h-2">
                  {gantt.months.map((m)=>(
                    <div key={m.iso} className="pointer-events-none absolute top-0 bottom-[-9999px] w-px bg-surface-track" style={{left:m.pos+"%"}} />
                  ))}
                  {gantt.feriados.map((f)=>(
                    <div key={f.iso} title={"Feriado · "+lbl(f.iso)} className="pointer-events-none absolute top-0 bottom-[-9999px] w-px bg-[#FED7AA]" style={{left:f.pos+"%"}} />
                  ))}
                  <div className="pointer-events-none absolute top-0 bottom-[-9999px] w-px bg-ok" style={{left:gantt.todayPos+"%"}} />
                  <span className="absolute -translate-x-1/2 -top-4 text-[12px] font-semibold text-ok whitespace-nowrap" style={{left:gantt.todayPos+"%"}}>hoy</span>
                </div>
                <div className="relative mt-3 space-y-4 touch-none cursor-crosshair"
                  onPointerDown={(e)=>{draggingRef.current=true; e.currentTarget.setPointerCapture?.(e.pointerId); pickDate(gantt,e.currentTarget,e.clientX,setGanttCursor,{});}}
                  onPointerMove={(e)=>{if(draggingRef.current) pickDate(gantt,e.currentTarget,e.clientX,setGanttCursor,{});}}
                  onPointerUp={()=>{draggingRef.current=false;}}
                  onPointerCancel={()=>{draggingRef.current=false; setGanttCursor(null);}}>
                  {gantt.months.map((m)=>(<div key={m.iso} className="pointer-events-none absolute inset-y-0 w-px bg-[#F5F4EF]" style={{left:m.pos+"%"}} />))}
                  {gantt.feriados.map((f)=>(<div key={f.iso} className="pointer-events-none absolute inset-y-0 w-px bg-[#FEF3E2]" style={{left:f.pos+"%"}} />))}
                  <div className="pointer-events-none absolute inset-y-0 w-px bg-ok" style={{left:gantt.todayPos+"%"}} />
                  {ganttCursor&&(
                    <div className="pointer-events-none absolute inset-y-0 w-px bg-ink z-20" style={{left:gantt.pos(ganttCursor.date)+"%"}}>
                      <div className="absolute -top-6 -translate-x-1/2 left-1/2 z-20 rounded-lg bg-ink text-white text-[12px] font-semibold px-2 py-1 whitespace-nowrap shadow-lg">
                        {lbl(ganttCursor.date)}
                      </div>
                    </div>
                  )}
                  {ganttList.map((proj)=>{
                    const collapsed=collapsedProj.has(proj.name);
                    const pesoResp=ganttCursor?pesoPorResponsableEnDia(proj.tasks,ganttCursor.date):null;
                    return (
                    <div key={proj.name}>
                      <button onClick={()=>toggleCollapse(proj.name)} aria-expanded={!collapsed}
                        className="w-full flex items-start gap-1.5 text-left active:opacity-70">
                        <Chevron open={!collapsed}/>
                        <span className="mt-1 w-1.5 h-1.5 rounded-full shrink-0" style={{background:ESTADO_COLOR[proj.estado]}} />
                        <span className="min-w-0 flex-1">
                          <span className="block text-[13.5px] font-semibold text-ink-soft truncate">{proj.name}</span>
                          {pesoResp?(
                            <span className="block text-[12.5px] text-ink font-semibold truncate">
                              {pesoResp.length?pesoResp.map((r)=>r.name+" ("+r.peso+")").join(", "):"Sin peso ese día"}
                            </span>
                          ):(
                            <span className="block text-[12.5px] text-muted truncate">{proj.responsables.length?proj.responsables.join(", "):"Sin responsable"}</span>
                          )}
                        </span>
                        <span className="shrink-0 ml-auto text-[12px] font-mono text-muted text-right">{proj.total} tareas{proj.overdue>0&&<span className="block font-semibold text-danger">{proj.overdue} venc.</span>}</span>
                      </button>
                      {!collapsed&&(
                        <div className="mt-2 ml-5 space-y-3">
                          {proj.tasks.map((t)=>{
                            const overdue=t.v&&t.v<TODAY;
                            const p0=t.v?gantt.pos(t.v):null;
                            const pi=t.vi?gantt.pos(t.vi):p0;
                            const resp=eff(t).join(", ");
                            return (
                              <div key={t.id}>
                                <div className="flex items-baseline justify-between gap-2">
                                  <span className="text-[13px] text-ink-soft truncate">{t.t}</span>
                                  <span className="shrink-0 text-[12px] font-mono" style={{color:overdue?"var(--color-danger)":"var(--color-muted)"}}>{rel(t.v).t}</span>
                                </div>
                                {resp&&<p className="text-[12px] text-muted truncate">{resp}</p>}
                                <div className="relative h-4 mt-1">
                                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[3px] rounded-full bg-surface-track" />
                                  {p0!==null&&pi!==null&&(
                                    <div className="absolute top-1/2 -translate-y-1/2 h-[3px] rounded-full" style={{left:Math.min(pi,p0)+"%",width:Math.max(0,p0-pi)+"%",backgroundColor:overdue?"#FCA5A5":t.c?"#BFDBFE":"var(--color-border-strong)"}} />
                                  )}
                                  {p0!==null&&(
                                    <div className="absolute top-1/2 -translate-y-1/2 w-[21px] h-[21px] rounded-full border-2 border-white shadow flex items-center justify-center text-[12px] font-bold text-white leading-none"
                                         style={{left:"calc("+p0+"% - 10.5px)",backgroundColor:overdue?"var(--color-danger)":t.c?"var(--color-info)":"#6B7280"}}>{t.e}</div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    );
                  })}
                  {ganttList.length===0&&(
                    <p className="py-6 text-center text-[14px] text-muted">Sin proyectos para este filtro.</p>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted">
              <Lg c="var(--color-danger)">Vencida</Lg><Lg c="var(--color-info)">En curso</Lg><Lg c="#6B7280">Sin iniciar</Lg>
              <span className="inline-flex items-center gap-1"><i className="w-3 h-px bg-ok inline-block"/>hoy</span>
              <span className="inline-flex items-center gap-1"><i className="w-3 h-1.5 bg-[#FDBA74] inline-block"/>feriado</span>
            </div>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">La barra va de la fecha de inicio a la de vencimiento (si "Fecha de Vencimiento" solo tiene un día, se usa como inicio y fin). El punto marca el vencimiento y el número dentro es el esfuerzo. Toca un proyecto para colapsar sus tareas.</p>
          </div>
        )}

        {tab==="bitacora"&&(
          <div role="tabpanel" id="panel-bitacora" aria-labelledby="tab-bitacora">
            <h2 className="sr-only">Bitácora de proyectos y responsables</h2>
            <div className="mt-4 rounded-2xl bg-white border border-border p-3 shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex rounded-xl bg-surface-inset p-0.5" role="group" aria-label="Vista de bitácora">
                  {[["proyecto","Por proyecto"],["responsable","Por responsable"]].map(([k,l])=>(
                    <button key={k} onClick={()=>setBitacoraVista(k)} aria-pressed={bitacoraVista===k}
                      className={"px-3 py-1.5 rounded-lg text-[14px] font-semibold transition-all "+(bitacoraVista===k?"bg-white text-ink shadow-sm":"text-muted")}>{l}</button>
                  ))}
                </div>
                <Help text={bitacoraVista==="proyecto"
                  ?"Cada caja es un proyecto y cada fila dentro, un responsable con sus tareas en el tiempo. Toca un punto para ver la tarea y cambiar su status."
                  :"Cada caja es un responsable. Con «Agrupar por proyecto» cada fila es un proyecto suyo; sin agrupar, todas sus tareas van en una sola línea."}/>
                {bitacoraVista==="responsable"&&(
                  <button onClick={()=>setBitacoraGroup((g)=>!g)} aria-pressed={bitacoraGroup}
                    className={"inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[13.5px] font-semibold border transition-colors "+(bitacoraGroup?"bg-ink text-white border-ink":"bg-white text-muted border-border")}>
                    <span aria-hidden="true" className="w-4 h-4 rounded-[4px] border flex items-center justify-center text-[12px] leading-none text-white"
                      style={{borderColor:bitacoraGroup?"#FFFFFF":"var(--color-muted)"}}>{bitacoraGroup?"✓":""}</span>
                    Agrupar por proyecto
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 min-w-[200px]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="absolute left-2.5 top-1/2 -translate-y-1/2">
                    <circle cx="11" cy="11" r="7" stroke="var(--color-muted)" strokeWidth="2"/><path d="M20 20l-4-4" stroke="var(--color-muted)" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <input value={bitacoraQuery} onChange={(e)=>setBitacoraQuery(e.target.value)} type="search"
                    placeholder="Buscar proyecto, responsable o tarea…" aria-label="Buscar en la bitácora"
                    className="w-full rounded-xl border border-border bg-surface-muted pl-8 pr-8 py-2 text-[14px] text-ink placeholder:text-muted focus:bg-white"/>
                  {bitacoraQuery&&(
                    <button onClick={()=>setBitacoraQuery("")} aria-label="Limpiar búsqueda"
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-surface-chip text-ink-soft text-[13.5px] font-bold leading-none hover:bg-[#DFDCD4]">×</button>
                  )}
                </div>
                <div className="inline-flex items-center gap-1">
                  <span className="text-[13.5px] text-muted">Ordenar</span>
                  <div className="inline-flex rounded-xl bg-surface-inset p-0.5" role="group" aria-label="Ordenar bitácora">
                    {[["vencidas","Vencidas"],["total","Tareas"],["nombre","A–Z"]].map(([k,l])=>(
                      <button key={k} onClick={()=>setBitacoraSort(k)} aria-pressed={bitacoraSort===k}
                        className={"px-2.5 py-1 rounded-lg text-[13.5px] font-semibold transition-all "+(bitacoraSort===k?"bg-white text-ink shadow-sm":"text-muted")}>{l}</button>
                    ))}
                  </div>
                </div>
              </div>

              <div role="group" aria-label="Filtrar por estado del proyecto" className="flex flex-wrap gap-2 pt-0.5 border-t border-[#F2F0EA]">
                <span className="text-[13.5px] text-muted self-center mr-0.5 pt-1.5" aria-hidden="true">Estado</span>
                <button onClick={()=>setBitacoraEstados([])} aria-pressed={bitacoraEstados.length===0}
                  className={"mt-1.5 px-2.5 py-1.5 rounded-full text-[13.5px] font-medium "+(bitacoraEstados.length===0?"bg-ink text-white":"bg-white text-muted border border-border")}>Todos</button>
                {GANTT_ESTADOS_SEL.map(([k,l])=>(
                  <button key={k} onClick={()=>toggleBitacoraEstado(k)} aria-pressed={bitacoraEstados.includes(k)}
                    className={"mt-1.5 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[13.5px] font-medium "+(bitacoraEstados.includes(k)?"bg-ink text-white":"bg-white text-muted border border-border")}>
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{background:ESTADO_COLOR[k]}} />{l}
                  </button>
                ))}
                {bitacoraEstados.length>0&&<button onClick={()=>setBitacoraEstados([])} className="mt-1.5 px-2.5 py-1.5 rounded-full text-[13.5px] font-semibold text-danger bg-white border border-[#FECACA]">Limpiar</button>}
              </div>
            </div>

            <SummaryRow items={bitacoraVista==="proyecto"
              ?[{n:bitacoraTot.cajas,l:"Proyectos"},{n:bitacoraTot.filas,l:"Responsables"},{n:bitacoraTot.vencidas,l:"Tareas vencidas"}]
              :[{n:bitacoraTot.cajas,l:"Responsables"},{n:bitacoraTot.filas,l:bitacoraGroup?"Proyectos":"Filas"},{n:bitacoraTot.vencidas,l:"Tareas vencidas"}]} />

            <p role="status" aria-live="polite" className="sr-only">
              {bitacoraTot.cajas+" resultados, "+bitacoraTot.vencidas+" tareas vencidas"}
            </p>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted">
                <span className="font-medium text-ink-soft">Toca un punto para ver la tarea</span>
                <span className="inline-flex items-center gap-1"><i className="w-3 h-3 rounded-full ring-2 ring-danger bg-white inline-block"/>Vencida</span>
                <span className="inline-flex items-center gap-1"><i className="w-3 h-3 rounded-full ring-2 ring-info bg-white inline-block"/>En curso</span>
                <span className="inline-flex items-center gap-1"><i className="w-3 h-px bg-ok inline-block"/>hoy</span>
                <span className="inline-flex items-center gap-1"><i className="w-3 h-px bg-[#FED7AA] inline-block"/>feriado</span>
              </div>
              {bitacoraBoxes.length>0&&(
                <button onClick={()=>setClosedBitacora(bitacoraAllOpen?new Set(bitacoraBoxes.map((b)=>b.key)):new Set())}
                  className="text-[13px] font-semibold text-ink underline underline-offset-2">{bitacoraAllOpen?"Colapsar todas":"Expandir todas"}</button>
              )}
            </div>

            {refreshErr&&<p role="alert" className="mt-2 text-[13.5px] text-[#B45309] bg-[#FEF3C7] border border-[#FDE68A] rounded-xl px-3 py-2">{refreshErr}</p>}
            <div className={"mt-2.5 space-y-2 "+(refreshing?"opacity-60 transition-opacity":"")} aria-busy={refreshing}>
              {bitacoraBoxes.length===0&&(
                <div className="rounded-2xl bg-white border border-border py-10 text-center">
                  <p className="text-[14px] text-muted">{bitacoraQuery?"Nada coincide con «"+bitacoraQuery+"».":"Sin tareas en este filtro."}</p>
                  {(bitacoraQuery||bitacoraEstados.length>0)&&(
                    <button onClick={()=>{setBitacoraQuery("");setBitacoraEstados([]);setBitacoraGroup(true);}}
                      className="mt-2 px-3 py-1.5 rounded-xl text-[13.5px] font-semibold bg-ink text-white">Limpiar filtros</button>
                  )}
                </div>
              )}
              {bitacoraBoxes.map((box)=>(
                <BitacoraBox key={box.key} box={box} query={bitacoraQuery}
                  collapsed={closedBitacora.has(box.key)} onToggle={()=>toggleOpenBitacora(box.key)}
                  onStatus={updateStatus} />
              ))}
            </div>

            <p className="mt-3 text-[13px] leading-relaxed text-muted">
              {bitacoraVista==="proyecto"
                ?"Cada caja es un proyecto; al expandirla, cada responsable tiene su línea de tiempo y el color identifica al responsable."
                :"Cada caja es un responsable y el color identifica al proyecto."}
              {" La barra va de inicio a vencimiento (si la fecha es de un solo día se usa como inicio y fin) y el punto marca el vencimiento con el esfuerzo dentro. Un aro rojo indica vencida y uno azul, en curso. Con ratón, arrastra sobre la línea para ver el peso activo de cada día; en móvil, tócala o elige el día en el selector. Los totales cuentan solo las tareas visibles en la caja."}
            </p>
          </div>
        )}


        {tab==="tickets"&&(
          <div role="tabpanel" id="panel-tickets" aria-labelledby="tab-tickets">
            <h2 className="sr-only">Tickets de soporte (Base de Tickets - Musa)</h2>
            <div className="mt-3 rounded-2xl bg-white border border-border px-3.5 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[13.5px] text-muted">Estado</span>
                {[["Abierto","Abierto"],["Cerrado","Cerrado"],["todas","Todos"]].map(([k,l])=>(
                  <button key={k} onClick={()=>setTicketEstado(k)} aria-pressed={ticketEstado===k}
                    className={"px-2.5 py-1 rounded-full text-[13.5px] font-medium "+(ticketEstado===k?"bg-ink text-white":"bg-white text-muted border border-border")}>
                    {l}{k==="Abierto"&&ticketsAbiertos>0?" ("+ticketsAbiertos+")":""}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[13.5px] text-muted self-center mr-0.5">Criticidad</span>
                <button onClick={()=>setTicketCrit("todas")} aria-pressed={ticketCrit==="todas"}
                  className={"px-2.5 py-1 rounded-full text-[13.5px] font-medium "+(ticketCrit==="todas"?"bg-ink text-white":"bg-white text-muted border border-border")}>Todas</button>
                {TICKET_CRITS.map((c)=>(
                  <button key={c} onClick={()=>setTicketCrit(c)} aria-pressed={ticketCrit===c}
                    className={"inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[13.5px] font-medium "+(ticketCrit===c?"bg-ink text-white":"bg-white text-muted border border-border")}>
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{background:CRIT_COLOR[c]}} />{c}
                  </button>
                ))}
              </div>
              <div className="relative">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="absolute left-2.5 top-1/2 -translate-y-1/2">
                  <circle cx="11" cy="11" r="7" stroke="var(--color-muted)" strokeWidth="2"/><path d="M20 20l-4-4" stroke="var(--color-muted)" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <input value={ticketQuery} onChange={(e)=>setTicketQuery(e.target.value)} type="search"
                  placeholder="Buscar por detalle, proyecto o categoría…" aria-label="Buscar en tickets"
                  className="w-full rounded-xl border border-border bg-surface-muted pl-8 pr-8 py-2 text-[14px] text-ink placeholder:text-muted focus:bg-white"/>
                {ticketQuery&&(
                  <button onClick={()=>setTicketQuery("")} aria-label="Limpiar búsqueda"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-surface-chip text-ink-soft text-[13.5px] font-bold leading-none hover:bg-[#DFDCD4]">×</button>
                )}
              </div>
            </div>
            <p className="mt-2.5 text-[13.5px] text-muted">{ticketsFiltrados.length} ticket{ticketsFiltrados.length===1?"":"s"} · fuente: base «Base de Tickets - Musa» en Notion.</p>
            <div className="mt-1.5 rounded-2xl bg-white border border-border px-4 py-1 shadow-[0_1px_2px_rgba(0,0,0,0.03)] divide-y divide-divider">
              {ticketsFiltrados.map((k)=><TicketItem key={k.pageId||k.id} k={k}/>)}
              {ticketsFiltrados.length===0&&<p className="text-[14px] text-muted py-8 text-center">{tickets.length?"Sin tickets en este filtro.":"Sin tickets cargados. Toca «Actualizar datos desde Notion»."}</p>}
            </div>
          </div>
        )}

        {tab!=="tickets"&&(
        <p className="mt-4 text-[13px] leading-relaxed text-muted">
          Excluidos: Operaciones Musa, Diego Herrera, Jorge Fernández y Mónica Ramos. Una tarea con varios responsables cuenta para cada uno.
          Bandas (N.º de tareas): Disponible ≤3 · Moderado 4–7 · Cargado 8–13 · Saturado ≥14. Hamilin concentra la bandeja de coordinación.
        </p>
        )}
      </div>
    </div>
  );
}

function SummaryRow({items}){
  return (<div className="mt-4 grid grid-cols-3 gap-2">
    {items.map((t)=>(<div key={t.l} className="rounded-2xl bg-white border border-border px-3 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="text-2xl font-bold font-mono tabular-nums">{t.n}</div>
      <div className="mt-0.5 text-[13px] leading-tight text-muted">{t.l}</div></div>))}
  </div>);
}
function Empty(){return <p className="text-[14px] text-muted py-8 text-center">Sin tareas en este filtro.</p>;}
function IndicatorCard({label,sub,value,valueColor,placeholder}){
  return (
    <div className="rounded-2xl bg-white border border-border px-3.5 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <h3 className="text-[13px] font-semibold tracking-[0.06em] uppercase text-muted">{label}</h3>
      <p className="mt-1.5 font-mono font-bold tabular-nums text-2xl" style={{color:valueColor}}>{value}</p>
      <p className="mt-1 text-[12.5px] leading-tight text-muted">{sub}{placeholder&&<span className="text-warn"> ⚠</span>}</p>
    </div>
  );
}
function Lg({c,children}){return <span className="inline-flex items-center gap-1"><i className="w-3 h-3 rounded-sm inline-block" style={{background:c}}/>{children}</span>;}

let helpSeq=0;
function Help({text}){
  const [open,setOpen]=useState(false);
  const id=useRef("help-"+(++helpSeq)).current;
  return (
    <span className="relative inline-block">
      <button type="button" onClick={()=>setOpen((o)=>!o)} onBlur={()=>setOpen(false)}
        onKeyDown={(e)=>{if(e.key==="Escape"){e.stopPropagation();setOpen(false);}}}
        aria-label="Ayuda" aria-describedby={open?id:undefined}
        className="w-6 h-6 rounded-full bg-surface-chip text-ink-soft text-[13px] font-bold inline-flex items-center justify-center shrink-0 align-middle leading-none hover:bg-[#DFDCD4]">?</button>
      {open&&(
        <span id={id} role="tooltip" className="absolute z-20 left-1/2 -translate-x-1/2 top-7 w-56 rounded-xl bg-ink text-white text-[13px] leading-snug px-2.5 py-2 shadow-lg text-left">{text}</span>
      )}
    </span>
  );
}

function Cell({v,cap,muted,ring,on,act,label}){
  const s=cellStyle(v,cap);
  return (
    <button onClick={on} disabled={!v} aria-label={label+(v?": "+v:": sin tareas")} aria-pressed={act}
      className={"w-9 h-9 mx-auto rounded-full flex items-center justify-center font-mono font-semibold tabular-nums text-[14px] leading-none transition-transform "+(v?"active:scale-95":"cursor-default")}
      style={{backgroundColor:muted?"var(--color-surface-sunken)":s.bg,color:muted?"var(--color-muted)":s.fg,
      boxShadow:act?"0 0 0 2px var(--color-ink)":ring?"0 0 0 2px var(--color-ok)":"none"}}>{v||""}</button>
  );
}

// ---- Bitácora ----------------------------------------------------------------
const LANE_H=26;       // alto de carril: iguala el área táctil mínima de 26px
const MIN_GAP_PX=26;   // separación mínima entre centros de dos puntos, en px reales

// Reparte las tareas de una fila en carriles para que sus áreas táctiles no se solapen.
// El hueco se deriva del ancho medido: en pantallas anchas hacen falta menos carriles.
function packLanes(tasks,scale,widthPx){
  const gap=(MIN_GAP_PX/Math.max(320,widthPx||520))*100;
  const dated=tasks.filter((t)=>t.v).map((t)=>{
    const p0=scale.pos(t.v);
    const pi=t.vi?scale.pos(t.vi):p0;
    return {t,p0,pi,start:Math.min(pi,p0),end:Math.max(pi,p0)};
  }).sort((a,b)=>a.start-b.start||a.end-b.end);
  const ends=[];
  for(const d of dated){
    let i=0;
    while(i<ends.length&&ends[i]>d.start) i++;
    if(i===ends.length) ends.push(0);
    ends[i]=d.end+gap;
    d.lane=i;
  }
  return {items:dated,lanes:Math.max(1,ends.length)};
}
const initials=(s)=>(s.match(/\p{L}+/gu)||["?"]).slice(0,2).map((w)=>w[0]).join("").toUpperCase();
const estadoTexto=(t)=>t.v&&t.v<TODAY?", vencida":t.c?", en curso":"";

function BitacoraBox({box,query,collapsed,onToggle,onStatus}){
  const [cursor,setCursor]=useState(null);
  const [sel,setSel]=useState(null);
  const [openSinFecha,setOpenSinFecha]=useState(false);
  const [aviso,setAviso]=useState(null);
  const [width,setWidth]=useState(520);
  const dragRef=useRef(false);
  const dotsRef=useRef({});
  const laneAreaRef=useRef(null);
  const scrollerRef=useRef(null);
  const scale=useMemo(()=>localScale(box.tasksAll),[box.tasksAll]);
  const q=(query||"").trim().toLowerCase();
  const match=(t)=>!q||(t.t||"").toLowerCase().includes(q)||(t.__ctx||"").toLowerCase().includes(q);
  const sinFecha=box.tasksAll.filter((t)=>!t.v);
  const dotKey=(t)=>t.__rowKey+"-"+t.id;

  // Mide el ancho real de la línea (separación entre puntos en px, no en %) y el ancho
  // visible del scroller (para que la ficha de detalle no exija scroll horizontal).
  useEffect(()=>{
    if(typeof ResizeObserver==="undefined") return;
    const lane=laneAreaRef.current, sc=scrollerRef.current;
    const update=()=>{ if(lane) setWidth(lane.getBoundingClientRect().width||520); };
    update(); // el primer callback del observer puede llegar antes del layout
    const ro=new ResizeObserver(update);
    if(lane) ro.observe(lane);
    if(sc) ro.observe(sc); // el scroller cambia de ancho sin que cambie el contenido
    return ()=>ro.disconnect();
  },[collapsed]);

  useEffect(()=>{
    if(!cursor&&!sel) return;
    const onKey=(e)=>{
      if(e.key!=="Escape") return;
      if(sel){ const el=dotsRef.current[dotKey(sel)]; setSel(null); el?.focus(); }
      setCursor(null);
    };
    document.addEventListener("keydown",onKey);
    return ()=>document.removeEventListener("keydown",onKey);
  },[cursor,sel]);
  useEffect(()=>{ // si la tarea sale del set (p. ej. pasó a Hecha), cierra el detalle
    if(sel&&!box.tasksAll.some((t)=>t.id===sel.id)) setSel(null);
  },[box.tasksAll,sel]);
  useEffect(()=>{
    if(!aviso) return;
    const id=setTimeout(()=>setAviso(null),4000);
    return ()=>clearTimeout(id);
  },[aviso]);

  const pick=(el,clientX)=>{
    if(!el) return;
    const rect=el.getBoundingClientRect();
    setCursor({date:dateFromPct(scale,((clientX-rect.left)/rect.width)*100)});
  };
  // Flechas para recorrer los puntos de una fila en orden cronológico.
  const onRowKeys=(e,items,idx)=>{
    const step={ArrowRight:1,ArrowLeft:-1}[e.key];
    let next=null;
    if(step!==undefined) next=idx+step;
    else if(e.key==="Home") next=0;
    else if(e.key==="End") next=items.length-1;
    else return;
    e.preventDefault();
    const target=items[Math.max(0,Math.min(items.length-1,next))];
    if(target) dotsRef.current[dotKey(target.t)]?.focus();
  };
  const cambiarStatus=async(t,status)=>{
    setAviso(null);
    await onStatus(t,status);
    setAviso(status==="Done"||status==="Stand by"
      ?{tipo:"ok",txt:"«"+t.t+"» pasó a "+(status==="Done"?"Hecha":"Stand by")+" y salió de la línea."}
      :{tipo:"ok",txt:"Status actualizado a "+(status==="In progress"?"En curso":"No iniciada")+"."});
  };

  return (
    <div className="rounded-2xl bg-white border border-border shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
         style={{borderLeft:"3px solid "+(box.vencidas>0?"var(--color-danger)":(box.color||"var(--color-neutral-dot)"))}}>
      <h3 className="sr-only">{box.name}</h3>
      <button onClick={onToggle} aria-expanded={!collapsed}
        aria-label={(collapsed?"Expandir ":"Colapsar ")+box.name}
        className="w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-2xl hover:bg-surface-muted active:bg-surface-sunken transition-colors">
        <Chevron open={!collapsed}/>
        <span className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold"
          style={{backgroundColor:"color-mix(in srgb, "+(box.color||"var(--color-muted)")+" 12%, transparent)",color:box.color||"var(--color-muted)"}} aria-hidden="true">{initials(box.name)}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-[14px] font-semibold leading-snug break-words">{box.name}</span>
          <span className="block text-[13px] text-muted truncate">{box.meta}</span>
        </span>
        <span className="shrink-0 text-right leading-tight">
          {box.vencidas>0?(
            <span className="block font-mono font-bold tabular-nums text-[16px] text-danger">
              {box.vencidas}<span className="text-[12px] font-semibold"> venc.</span>
            </span>
          ):(
            <span className="block text-[13px] font-semibold text-ok">al día</span>
          )}
          <span className="block text-[13px] text-muted font-mono tabular-nums">{box.total} tareas</span>
        </span>
      </button>

      {!collapsed&&(
        <div className="border-t border-[#F0EEE8] px-3 pb-3 pt-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[13px] text-muted font-mono">{lbl(scale.minD)} → {lbl(scale.maxD)}</p>
            <div className="inline-flex flex-wrap items-center gap-1.5">
              {cursor&&(
                <span className="inline-flex items-center gap-1 px-2 min-h-[24px] rounded-full bg-surface-sunken text-[13px] font-mono font-bold text-ink"
                  title={"Peso total activo de "+box.name+" el "+lbl(cursor.date)}>
                  {lbl(cursor.date)} · peso total {pesoActivoEnDia(box.tasksAll,cursor.date)}
                </span>
              )}
              <label className="text-[13px] text-muted" htmlFor={"day-"+box.key}>Día</label>
              <input id={"day-"+box.key} type="date" min={scale.minD} max={scale.maxD}
                value={cursor?cursor.date:""} onChange={(e)=>setCursor(e.target.value?{date:e.target.value}:null)}
                className="text-[13px] min-h-[32px] border border-border rounded-lg px-1.5 bg-white text-ink-soft"/>
              {cursor&&(
                <button onClick={()=>setCursor(null)}
                  className="inline-flex items-center gap-1 px-2 min-h-[24px] rounded-full bg-ink text-white text-[13px] font-semibold">
                  quitar ×
                </button>
              )}
            </div>
          </div>
          <div ref={scrollerRef} className="overflow-x-auto">
            <div className="min-w-[520px] px-1">
              <div className="relative h-5 mt-1 text-[12px] text-muted font-mono">
                {scale.months.map((m)=>(<span key={m.iso} className="absolute -translate-x-1/2 whitespace-nowrap" style={{left:m.pos+"%"}}>{m.label}</span>))}
                <span className="absolute -translate-x-1/2 -top-3 font-semibold text-ok" style={{left:scale.todayPos+"%"}}>hoy</span>
              </div>
              {(()=>{
                const n=scale.days.length;
                // Aclarado por densidad: el eje mide ~641px, así que espaciamos las
                // etiquetas para que los números no se solapen en rangos largos
                // (subvista Responsable de la bitácora agrega varios proyectos).
                const keep=n<=25?()=>true:n<=45?(d)=>d.dom%2===1:n<=90?(d)=>d.dom%5===0:(d)=>d.dom%10===0;
                return (
                  <div className="relative h-4 mt-0.5 text-[12px] font-mono">
                    {scale.days.filter(keep).map((d)=>(
                      <span key={d.iso} title={lbl(d.iso)+(FERIADOS.has(d.iso)?" · feriado":"")} className="absolute -translate-x-1/2"
                        style={{left:d.pos+"%",color:FERIADOS.has(d.iso)?"#991B1B":"var(--color-muted)",fontWeight:d.iso===TODAY?700:400}}>{d.dom}</span>
                    ))}
                  </div>
                );
              })()}
              <div ref={laneAreaRef} className="relative mt-2.5 space-y-2.5 md:cursor-crosshair"
                style={{touchAction:"pan-x pan-y"}}
                onPointerDown={(e)=>{
                  if(e.pointerType==="touch"){ pick(e.currentTarget,e.clientX); return; }
                  dragRef.current=true; e.currentTarget.setPointerCapture?.(e.pointerId); pick(e.currentTarget,e.clientX);
                }}
                onPointerMove={(e)=>{if(dragRef.current&&e.pointerType!=="touch") pick(e.currentTarget,e.clientX);}}
                onPointerUp={()=>{dragRef.current=false;}}
                onPointerCancel={()=>{dragRef.current=false;}}>
                {scale.days.length<=45
                  ?scale.days.filter((d)=>d.weekend).map((d)=>(<div key={d.iso} className="pointer-events-none absolute inset-y-0 w-[3px] -translate-x-1/2 bg-surface-track" style={{left:d.pos+"%"}} />))
                  :scale.months.map((m)=>(<div key={m.iso} className="pointer-events-none absolute inset-y-0 w-px bg-[#F5F4EF]" style={{left:m.pos+"%"}} />))}
                {scale.feriados.map((f)=>(<div key={f.iso} title={"Feriado · "+lbl(f.iso)} className="pointer-events-none absolute inset-y-0 w-[3px] -translate-x-1/2 bg-[#FDBA74]/70" style={{left:f.pos+"%"}} />))}
                <div className="pointer-events-none absolute inset-y-0 w-px bg-ok" style={{left:scale.todayPos+"%"}} />
                {cursor&&<div className="pointer-events-none absolute inset-y-0 w-px bg-ink z-20" style={{left:scale.pos(cursor.date)+"%"}} />}

                {box.rows.map((row)=>{
                  const {items,lanes}=packLanes(row.tasks,scale,width);
                  const peso=cursor?pesoActivoEnDia(row.tasks,cursor.date):null;
                  const focusable=items.filter((d)=>match(d.t));
                  return (
                    <div key={row.key}>
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 min-w-0">
                          {row.color&&<span className="w-2 h-2 rounded-full shrink-0" style={{background:row.color}} />}
                          <span className="text-[13px] font-medium text-ink-soft truncate" title={row.label}>{row.label}</span>
                        </span>
                        {peso!==null?(
                          <span className="shrink-0 text-[13px] font-mono font-bold text-ink">peso {peso}</span>
                        ):(
                          <span className="shrink-0 text-[13px] font-mono text-muted">
                            {row.total} tarea{row.total!==1?"s":""}
                            {row.vencidas>0&&<span className="font-semibold text-danger"> · {row.vencidas} venc.</span>}
                            {row.sinfecha>0&&<span> · {row.sinfecha} s/f</span>}
                          </span>
                        )}
                      </div>
                      <div role="group" aria-label={row.label+", línea de tiempo, "+row.total+" tareas"}
                        className="relative mt-1" style={{height:lanes*LANE_H}}>
                        {Array.from({length:lanes}).map((_,i)=>(
                          <div key={i} className="absolute inset-x-0 h-[3px] rounded-full bg-surface-track" style={{top:i*LANE_H+LANE_H/2-1.5}} />
                        ))}
                        {items.map((d)=>{
                          const t=d.t;
                          const color=t.__color||row.color||"#6B7280";
                          const selected=sel&&sel.id===t.id&&sel.__rowKey===t.__rowKey;
                          const dim=!match(t)&&!selected;
                          const overdue=t.v<TODAY;
                          // Vencida = aro doble (grosor + patrón), no solo tono: el color no es la única señal.
                          const ring=selected?"0 0 0 3px var(--color-ink)"
                            :overdue?"0 0 0 2px #FFFFFF, 0 0 0 4px var(--color-danger)"
                            :t.c?"0 0 0 2px var(--color-info)":"none";
                          const mid=d.lane*LANE_H+LANE_H/2;
                          const hasRange=Math.abs(d.end-d.start)>0.05;
                          const fi=focusable.indexOf(d);
                          return (
                            <React.Fragment key={dotKey(t)}>
                              <div className="pointer-events-none absolute h-[4px] rounded-full"
                                style={{left:d.start+"%",width:(d.end-d.start)+"%",top:mid-2,backgroundColor:color,opacity:dim?0.18:0.45}} />
                              {hasRange&&(
                                <div className="pointer-events-none absolute w-[9px] h-[9px] rounded-full border-2 border-white"
                                  style={{left:d.pi+"%",top:mid,transform:"translate(-50%,-50%)",backgroundColor:color,opacity:dim?0.3:1}} />
                              )}
                              <button type="button"
                                ref={(el)=>{dotsRef.current[dotKey(t)]=el;}}
                                onPointerDown={(e)=>e.stopPropagation()}
                                onClick={(e)=>{e.stopPropagation();setSel(selected?null:t);}}
                                onKeyDown={(e)=>onRowKeys(e,focusable,fi)}
                                tabIndex={dim?-1:(fi===0?0:-1)}
                                aria-expanded={!!selected} aria-controls={selected?"det-"+dotKey(t):undefined}
                                aria-label={t.t+" ("+(t.__ctx||"")+"), vence "+fdate(t.v)+", esfuerzo "+t.e+estadoTexto(t)}
                                className="absolute w-[26px] h-[26px] p-0 bg-transparent border-0 flex items-center justify-center hover:z-30"
                                style={{left:d.p0+"%",top:mid,transform:"translate(-50%,-50%)",zIndex:selected?25:10}}>
                                <span aria-hidden="true"
                                  className="w-[21px] h-[21px] rounded-full border-2 border-white flex items-center justify-center text-[12px] font-bold text-white leading-none transition-transform duration-150 hover:scale-110"
                                  style={{backgroundColor:color,boxShadow:ring,opacity:dim?0.3:1}}>{t.e}</span>
                              </button>
                            </React.Fragment>
                          );
                        })}
                      </div>
                      {row.key==="__all"&&(
                        <div className="mt-1.5 flex flex-wrap gap-x-2.5 gap-y-1">
                          {[...new Map(row.tasks.map((t)=>[t.__ctx,t.__color]))].map(([lab,c])=>(
                            <span key={lab} className="inline-flex items-center gap-1 text-[13px] text-muted max-w-[220px]">
                              <i className="w-2 h-2 rounded-full shrink-0" style={{background:c}} /><span className="truncate">{lab}</span>
                            </span>
                          ))}
                        </div>
                      )}
                      {sel&&sel.__rowKey===row.key&&(
                        <div className="sticky left-0 w-[min(100%,calc(100vw-2.5rem))]">
                          <TaskDetail t={sel} aviso={aviso}
                            onClose={()=>{const el=dotsRef.current[dotKey(sel)];setSel(null);el?.focus();}}
                            onStatus={onStatus?cambiarStatus:null}/>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {sinFecha.length>0&&(
            <div className="mt-2.5 border-t border-[#F2F0EA] pt-2">
              <button onClick={()=>setOpenSinFecha((o)=>!o)} aria-expanded={openSinFecha}
                className="inline-flex items-center gap-1.5 min-h-[24px] text-[13px] font-semibold text-muted">
                <Chevron open={openSinFecha}/>{sinFecha.length} tarea{sinFecha.length!==1?"s":""} sin fecha (no aparecen en la línea)
              </button>
              {openSinFecha&&(
                <div className="mt-1 pl-1 divide-y divide-[#F5F4EF]">
                  {sinFecha.map((t)=>(
                    <button key={dotKey(t)} onClick={()=>setSel(t)}
                      className="w-full text-left py-2 min-h-[44px] flex items-start gap-2 hover:bg-surface-muted active:bg-surface-sunken">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{background:t.__color||"var(--color-neutral-dot)"}} />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[14px] leading-snug text-ink-soft">{t.t}</span>
                        <span className="block text-[13px] text-muted truncate">{t.__ctx}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
              {sel&&!sel.v&&(
                <TaskDetail t={sel} aviso={aviso}
                  onClose={()=>setSel(null)} onStatus={onStatus?cambiarStatus:null}/>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TaskDetail({t,onClose,onStatus,aviso}){
  const r=rel(t.v);
  const resp=eff(t).join(", ");
  const ref=useRef(null);
  useEffect(()=>{
    ref.current?.focus({preventScroll:true});
    ref.current?.scrollIntoView({block:"nearest"});
  },[t.id,t.__rowKey]);
  return (
    <div id={"det-"+t.__rowKey+"-"+t.id} ref={ref} tabIndex={-1} role="group" aria-label={"Detalle: "+t.t}
      onPointerDown={(e)=>e.stopPropagation()}
      className="mt-2.5 rounded-xl border border-[#E4E1D9] bg-surface-muted p-3">
      <div className="flex items-start gap-2">
        <span className="mt-1.5 w-2 h-2 rounded-full shrink-0" style={{background:t.__color||"var(--color-muted)"}} />
        <p className="flex-1 text-[14px] font-semibold leading-snug text-ink">{t.t}</p>
        <button onClick={onClose} aria-label="Cerrar detalle"
          className="shrink-0 w-8 h-8 rounded-full bg-surface-chip text-ink-soft text-[14px] font-bold leading-none hover:bg-[#DFDCD4]">×</button>
      </div>
      <dl className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-x-3 gap-y-1.5 text-[13px]">
        {t.__ctx&&(<div><dt className="text-muted">{t.__proyecto?"Proyecto":"Responsable"}</dt><dd className="font-medium text-ink-soft break-words">{t.__ctx}</dd></div>)}
        <div><dt className="text-muted">Inicio</dt><dd className="font-mono text-ink-soft">{fdate(t.vi)}</dd></div>
        <div><dt className="text-muted">Vence</dt><dd className="font-mono text-ink-soft">{fdate(t.v)} <span className="font-semibold" style={{color:r.c}}>· {r.t}</span></dd></div>
        <div><dt className="text-muted">Esfuerzo</dt><dd className="font-mono text-ink-soft">{t.e}</dd></div>
        {resp&&(<div className="col-span-2 sm:col-span-4"><dt className="text-muted">Responsables</dt><dd className="text-ink-soft">{resp}</dd></div>)}
      </dl>
      {onStatus&&t.pageId?(
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <label className="text-[13px] text-muted" htmlFor={"st-"+t.__rowKey+"-"+t.id}>Status</label>
          <select id={"st-"+t.__rowKey+"-"+t.id} value={t.status||""} onChange={(e)=>{if(e.target.value)onStatus(t,e.target.value);}}
            className="text-[16px] sm:text-[13.5px] font-medium min-h-[44px] sm:min-h-[32px] border border-border rounded-lg px-2 bg-white text-ink-soft">
            <option value="" disabled>Cambiar…</option>
            <option value="Not started">No iniciada</option>
            <option value="In progress">En curso</option>
            <option value="Done">Hecha</option>
            <option value="Stand by">Stand by</option>
          </select>
        </div>
      ):(
        <p className="mt-2 text-[13px] text-muted">Status: {t.status||"—"} (sin enlace a Notion)</p>
      )}
      {aviso&&(
        <p role="status" className="mt-2 text-[13px] font-semibold text-ok">{aviso.txt}</p>
      )}
    </div>
  );
}
