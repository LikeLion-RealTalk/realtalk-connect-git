import { Position, SpeakerStatus } from '../types/discussion';

export interface Speaker {
  id: string;
  name: string;
  position: Position;
  status: SpeakerStatus;
  avatar: string;
  isCreator: boolean;
}

export const MOCK_SPEAKERS: Speaker[] = [
  {
    id: '1',
    name: '김민수',
    position: 'A입장',
    status: '발언중',
    avatar: '',
    isCreator: true
  },
  {
    id: '2',
    name: '이영희',
    position: 'B입장',
    status: '대기중',
    avatar: '',
    isCreator: false
  },
  {
    id: '3',
    name: '박철수',
    position: 'A입장',
    status: '대기중',
    avatar: '',
    isCreator: false
  },
  {
    id: '4',
    name: '정미경',
    position: 'B입장',
    status: '대기중',
    avatar: '',
    isCreator: false
  }
];