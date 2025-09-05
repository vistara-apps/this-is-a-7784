export const stateRightsData = {
  'California': {
    en: {
      title: 'Your Rights in California',
      rights: [
        'You have the right to remain silent',
        'You have the right to refuse consent to searches',
        'You have the right to an attorney',
        'You have the right to know why you are being stopped',
        'You have the right to record police interactions',
        'You cannot be detained without reasonable suspicion'
      ],
      doNotSay: [
        '"I have nothing to hide"',
        '"You can search my car/house"',
        '"I waive my rights"',
        'Anything about drugs, weapons, or illegal activities',
        'False information about your identity',
        '"I understand" (to unclear questions)'
      ],
      scripts: {
        policeStop: `"Officer, I am exercising my right to remain silent. I do not consent to any searches. I would like to speak with an attorney. Am I free to go?"

If detained: "I am invoking my Fifth Amendment right to remain silent and my Sixth Amendment right to an attorney. I do not consent to any searches."`,
        searchRefusal: `"I do not consent to any search of my person, belongings, or vehicle. I am exercising my Fourth Amendment rights. If you have a warrant, I will comply, but I do not consent to any search."`,
        silentInvocation: `"I am invoking my Fifth Amendment right to remain silent. I will not answer questions without an attorney present. I request an attorney now."`
      }
    },
    es: {
      title: 'Tus Derechos en California',
      rights: [
        'Tienes derecho a permanecer en silencio',
        'Tienes derecho a negarte a consentir búsquedas',
        'Tienes derecho a un abogado',
        'Tienes derecho a saber por qué te detienen',
        'Tienes derecho a grabar interacciones policiales',
        'No pueden detenerte sin sospecha razonable'
      ],
      doNotSay: [
        '"No tengo nada que esconder"',
        '"Pueden buscar en mi carro/casa"',
        '"Renuncio a mis derechos"',
        'Cualquier cosa sobre drogas, armas o actividades ilegales',
        'Información falsa sobre tu identidad',
        '"Entiendo" (a preguntas poco claras)'
      ],
      scripts: {
        policeStop: `"Oficial, estoy ejerciendo mi derecho a permanecer en silencio. No consiento a ninguna búsqueda. Me gustaría hablar con un abogado. ¿Soy libre de irme?"

Si eres detenido: "Estoy invocando mi derecho de la Quinta Enmienda a permanecer en silencio y mi derecho de la Sexta Enmienda a un abogado. No consiento a ninguna búsqueda."`,
        searchRefusal: `"No consiento a ninguna búsqueda de mi persona, pertenencias o vehículo. Estoy ejerciendo mis derechos de la Cuarta Enmienda. Si tiene una orden judicial, cumpliré, pero no consiento a ninguna búsqueda."`,
        silentInvocation: `"Estoy invocando mi derecho de la Quinta Enmienda a permanecer en silencio. No responderé preguntas sin un abogado presente. Solicito un abogado ahora."`
      }
    }
  },
  'Texas': {
    en: {
      title: 'Your Rights in Texas',
      rights: [
        'You have the right to remain silent',
        'You have the right to refuse consent to searches',
        'You have the right to an attorney',
        'You must provide ID if lawfully arrested',
        'You have the right to record police (in public)',
        'Police need probable cause to search without consent'
      ],
      doNotSay: [
        '"I have nothing to hide"',
        '"Go ahead and search"',
        '"I waive my rights"',
        'Anything about weapons or illegal items',
        'False personal information',
        'Admissions of guilt'
      ],
      scripts: {
        policeStop: `"Officer, I am exercising my right to remain silent. I do not consent to searches. I want an attorney. Am I under arrest or am I free to go?"`,
        searchRefusal: `"I do not consent to any search. I am exercising my constitutional rights. If you have a warrant, please show it to me."`,
        silentInvocation: `"I invoke my right to remain silent under the Fifth Amendment. I want to speak with an attorney before answering any questions."`
      }
    },
    es: {
      title: 'Tus Derechos en Texas',
      rights: [
        'Tienes derecho a permanecer en silencio',
        'Tienes derecho a negarte a búsquedas',
        'Tienes derecho a un abogado',
        'Debes proporcionar ID si eres arrestado legalmente',
        'Tienes derecho a grabar policía (en público)',
        'Policía necesita causa probable para buscar sin consentimiento'
      ],
      doNotSay: [
        '"No tengo nada que esconder"',
        '"Adelante, busquen"',
        '"Renuncio a mis derechos"',
        'Cualquier cosa sobre armas o artículos ilegales',
        'Información personal falsa',
        'Admisiones de culpabilidad'
      ],
      scripts: {
        policeStop: `"Oficial, estoy ejerciendo mi derecho a permanecer en silencio. No consiento búsquedas. Quiero un abogado. ¿Estoy arrestado o soy libre de irme?"`,
        searchRefusal: `"No consiento a ninguna búsqueda. Estoy ejerciendo mis derechos constitucionales. Si tiene una orden, por favor muéstremela."`,
        silentInvocation: `"Invoco mi derecho a permanecer en silencio bajo la Quinta Enmienda. Quiero hablar con un abogado antes de responder preguntas."`
      }
    }
  }
}