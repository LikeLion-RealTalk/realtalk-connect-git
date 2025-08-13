import { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { DiscussionCategory, DebateType, ParticipationRole, PARTICIPATION_ROLES } from '../../types/discussion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { User, Share2, Users, Mic, LogOut, UserCircle, Settings, Menu } from 'lucide-react';
import { LoginModal } from '../modal/LoginModal';
import { useUser } from '../UserProvider';
import { MaterialAppBar, MaterialButton } from '../MaterialDesign';
import realTalkLogo from '/images/realtalkLogo.png';
import {ImageWithFallback} from "./../figma/ImageWithFallback";

interface DebateHeaderProps {
  title: string;
  category: DiscussionCategory;
  debateType: DebateType;
  participationMode: ParticipationRole;
  onModeChange: (mode: ParticipationRole) => void;
  onShare: () => void;
  onNavigate?: (page: 'landing' | 'browser' | 'debate') => void;
}

export function DebateHeader({ 
  title, 
  category, 
  debateType, 
  participationMode, 
  onModeChange, 
  onShare,
  onNavigate
}: DebateHeaderProps) {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { user, isLoggedIn, nickname, logout, openProfile, openSettings } = useUser();

  const handleLoginClick = () => {
    setIsLoginModalOpen(true);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <>
    <MaterialAppBar position="sticky" color="surface" className="border-b border-divider backdrop-blur supports-[backdrop-filter]:bg-surface/95">
      {/* 왼쪽 영역 */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* 로고 - 모바일에서 숨김(기존) */}
{/*        <div
          className="font-bold text-xl text-primary cursor-pointer hover:opacity-80 transition-material hidden lg:block"
          onClick={() => onNavigate?.('landing')}
        >
          RealTalk
        </div>*/}
        <button
            className="cursor-pointer hover:opacity-80 transition-material hidden lg:block"
            onClick={() => onNavigate?.('landing')}
        >
          <ImageWithFallback
              src={realTalkLogo}
              alt="RealTalk"
              className="h-8 w-auto"
          />
        </button>
      </div>

      {/* 중앙 영역 */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 min-w-0">
        {/* 데스크톱에서는 항상 표시 */}
        <div className="hidden lg:flex lg:flex-col lg:items-center lg:justify-center">
          <h1 className="truncate text-center max-w-full text-lg font-medium text-on-surface">{title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="border-divider text-on-surface-variant bg-surface-variant/50 rounded-full text-xs">
              {category}
            </Badge>
            <Badge 
              className={`rounded-full text-xs ${
                debateType === '3분토론' 
                  ? 'bg-primary text-on-primary' 
                  : 'bg-secondary text-on-secondary'
              }`}
            >
              {debateType}
            </Badge>
          </div>
        </div>

        {/* 모바일에서는 확장 가능한 영역 */}
        <div className="lg:hidden flex flex-col items-center justify-center w-full min-w-0">
          <div 
            className="cursor-pointer transition-all duration-300 w-full max-w-full"
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <h1 className="truncate text-center text-lg font-medium text-on-surface px-2">{title}</h1>
          </div>
          
          <div 
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isExpanded 
                ? 'max-h-10 opacity-100 mt-1' 
                : 'max-h-0 opacity-0 mt-0'
            }`}
          >
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-divider text-on-surface-variant bg-surface-variant/50 rounded-full text-xs">
                {category}
              </Badge>
              <Badge 
                className={`rounded-full text-xs ${
                  debateType === '3분토론' 
                    ? 'bg-primary text-on-primary' 
                    : 'bg-secondary text-on-secondary'
                }`}
              >
                {debateType}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* 우측 영역 */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* 참여 모드 변경 버튼 */}
        <MaterialButton
          variant={participationMode === PARTICIPATION_ROLES[0] ? 'contained' : 'outlined'}
          color="primary"
          size="small"
          className="flex items-center gap-1"
          onClick={() => onModeChange(participationMode === PARTICIPATION_ROLES[0] ? PARTICIPATION_ROLES[1] : PARTICIPATION_ROLES[0])}
        >
          {participationMode === PARTICIPATION_ROLES[0] ? <Mic className="h-4 w-4" /> : <Users className="h-4 w-4" />}
          <span className="hidden sm:inline">{participationMode}</span>
        </MaterialButton>

        {/* 공유 버튼 */}
        <Button variant="ghost" size="sm" onClick={onShare} className="hover:bg-primary/10 transition-material">
          <Share2 className="h-4 w-4" />
        </Button>

        {/* 사용자 영역 */}
        {isLoggedIn ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 h-auto p-2 hover:bg-primary/10 transition-material">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback>{user?.username[0]}</AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline text-sm">{user?.username}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 elevation-8 rounded-lg">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.username}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.provider}로 로그인</p>
                  {nickname && (
                    <p className="text-xs leading-none text-muted-foreground">
                      토론명: <span className="text-primary font-medium">{nickname}</span>
                    </p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={openProfile} className="hover:bg-primary/10 transition-material">
                <UserCircle className="mr-2 h-4 w-4" />
                <span>프로필</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={openSettings} className="hover:bg-primary/10 transition-material">
                <Settings className="mr-2 h-4 w-4" />
                <span>설정</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="hover:bg-error/10 text-error transition-material">
                <LogOut className="mr-2 h-4 w-4" />
                <span>로그아웃</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="ghost" size="sm" className="flex items-center gap-2 hover:bg-primary/10 transition-material" onClick={handleLoginClick}>
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">로그인</span>
          </Button>
        )}
      </div>
    </MaterialAppBar>
    
    <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </>
  );
}