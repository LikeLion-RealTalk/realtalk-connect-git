import { useState } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Filter, X } from 'lucide-react';
import { 
  FilterOptions, 
  DISCUSSION_CATEGORIES, 
  DEBATE_TYPES, 
  DISCUSSION_STATUSES 
} from '../../types/discussion';



interface SearchFilterProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: FilterOptions) => void;
}

export function SearchFilter({ onSearch, onFilterChange }: SearchFilterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<FilterOptions>({
    categories: [],
    discussionTypes: [],
    statuses: []
  });

  // 전역 상수에서 가져온 옵션들 사용

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleFilterToggle = (type: keyof FilterOptions, value: string) => {
    const newFilters = { ...selectedFilters };
    const currentArray = newFilters[type];
    
    if (currentArray.includes(value)) {
      newFilters[type] = currentArray.filter(item => item !== value);
    } else {
      newFilters[type] = [...currentArray, value];
    }
    
    setSelectedFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    const emptyFilters = { categories: [], discussionTypes: [], statuses: [] };
    setSelectedFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const hasActiveFilters = selectedFilters.categories.length > 0 || 
                          selectedFilters.discussionTypes.length > 0 || 
                          selectedFilters.statuses.length > 0;

  return (
    <div className="w-full">
      <div className="p-3 border rounded-lg bg-background">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            type="text"
            placeholder="토론 주제와 설명을 검색하세요..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            필터
          </Button>
        </form>
      </div>

      {showFilters && (
        <Card className="mt-2">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">필터 옵션</h3>
              {hasActiveFilters && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearAllFilters}
                  className="text-muted-foreground"
                >
                  초기화
                </Button>
              )}
            </div>

            <div className="space-y-4">
              {/* 카테고리 */}
              <div>
                <label className="block mb-2">카테고리</label>
                <div className="flex flex-wrap gap-2">
                  {DISCUSSION_CATEGORIES.map((category) => (
                    <Badge
                      key={category}
                      variant={selectedFilters.categories.includes(category) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleFilterToggle('categories', category)}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* 토론방식 */}
              <div>
                <label className="block mb-2">토론방식</label>
                <div className="flex flex-wrap gap-2">
                  {DEBATE_TYPES.map((type) => (
                    <Badge
                      key={type}
                      variant={selectedFilters.discussionTypes.includes(type) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleFilterToggle('discussionTypes', type)}
                    >
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* 진행상태 */}
              <div>
                <label className="block mb-2">진행상태</label>
                <div className="flex flex-wrap gap-2">
                  {DISCUSSION_STATUSES.map((status) => (
                    <Badge
                      key={status}
                      variant={selectedFilters.statuses.includes(status) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleFilterToggle('statuses', status)}
                    >
                      {status}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}