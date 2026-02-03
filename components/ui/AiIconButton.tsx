import { TouchableOpacity, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { PulsatingIcon } from './pulsatingIcon';

const AiIconButton = ( { aiFunction } : { aiFunction?: () => Promise<void> }) => {
  const [loading , setLoading] = useState(false);

  const handlePress =  async () => {
        try{
            setLoading(true);
            await aiFunction?.();
        } catch(err)
        {
            console.log(err);
        } finally {
            setLoading(false);
        }
        
  }



  return (
    <TouchableOpacity onPress={handlePress}>
        <PulsatingIcon
            trigger={loading}
            pulseDuration={500}
            icons={["bulb-outline", "bulb"]}
            size={24}
            color={Colors.primary}
        />
    </TouchableOpacity>
  )
}

export {AiIconButton};