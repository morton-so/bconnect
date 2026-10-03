/**
 * @figma https://www.figma.com/design/EFXofON7gTFbmbE2kB31SS?node-id=1569-5584
 * @figma https://www.figma.com/design/EFXofON7gTFbmbE2kB31SS?node-id=1867-11271
 * @figma https://www.figma.com/design/EFXofON7gTFbmbE2kB31SS?node-id=1570-7514
 * @figma https://www.figma.com/design/EFXofON7gTFbmbE2kB31SS?node-id=1570-7726
 */
import type { Metadata } from 'next'

import { CalendarScreen } from './_components/CalendarScreen'

export const metadata: Metadata = { title: '캘린더' }

export default function CalendarPage() {
  return <CalendarScreen />
}
