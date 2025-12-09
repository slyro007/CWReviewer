import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Check, Users } from 'lucide-react';
import type { ConnectWiseMember } from '../types';

interface EmployeeSelectorProps {
  members: ConnectWiseMember[];
  selectedMembers: ConnectWiseMember[];
  onSelect: (member: ConnectWiseMember) => void;
  onMultiSelect: (members: ConnectWiseMember[]) => void;
  loading?: boolean;
}

const EmployeeSelector: React.FC<EmployeeSelectorProps> = ({
  members,
  selectedMembers,
  onSelect,
  onMultiSelect,
  loading,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const filteredMembers = useMemo(() => {
    if (!searchQuery) return members;
    const query = searchQuery.toLowerCase();
    return members.filter(
      (member) =>
        member.firstName.toLowerCase().includes(query) ||
        member.lastName.toLowerCase().includes(query) ||
        member.identifier.toLowerCase().includes(query) ||
        (member.email && member.email.toLowerCase().includes(query))
    );
  }, [members, searchQuery]);

  const handleMemberClick = (member: ConnectWiseMember) => {
    if (isMultiSelect) {
      const isSelected = selectedMembers.some((m) => m.id === member.id);
      if (isSelected) {
        onMultiSelect(selectedMembers.filter((m) => m.id !== member.id));
      } else {
        onMultiSelect([...selectedMembers, member]);
      }
    } else {
      onSelect(member);
      setIsOpen(false);
    }
  };

  const isSelected = (memberId: number) => {
    return selectedMembers.some((m) => m.id === memberId);
  };

  return (
    <div className="relative">
      <h3 className="text-lg font-semibold text-cyan-400 mb-4">Select Employee</h3>

      {/* Multi-select toggle */}
      <div className="mb-4 flex items-center gap-2">
        <button
          onClick={() => {
            setIsMultiSelect(!isMultiSelect);
            if (!isMultiSelect) {
              onMultiSelect([]);
            }
          }}
          className={`flex-1 px-3 py-2 rounded-lg text-sm transition-all ${
            isMultiSelect
              ? 'bg-cyan-500/20 border border-cyan-400/50 text-cyan-300'
              : 'bg-white/5 hover:bg-white/10 text-gray-300'
          }`}
        >
          <Users className="w-4 h-4 inline mr-2" />
          {isMultiSelect ? 'Multi-Select' : 'Single Select'}
        </button>
      </div>

      {/* Selected members display */}
      {selectedMembers.length > 0 && (
        <div className="mb-4 space-y-2">
          {selectedMembers.map((member) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between glass-dark p-2 rounded-lg"
            >
              <span className="text-sm text-gray-300">
                {member.firstName} {member.lastName}
              </span>
              <button
                onClick={() => {
                  if (isMultiSelect) {
                    onMultiSelect(selectedMembers.filter((m) => m.id !== member.id));
                  } else {
                    onMultiSelect([]);
                  }
                }}
                className="text-red-400 hover:text-red-300"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Search and dropdown */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50"
          />
        </div>

        <AnimatePresence>
          {isOpen && filteredMembers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-50 w-full mt-2 glass-bright rounded-lg shadow-xl max-h-96 overflow-y-auto"
            >
              {filteredMembers.map((member) => {
                const selected = isSelected(member.id);
                return (
                  <motion.button
                    key={member.id}
                    onClick={() => handleMemberClick(member)}
                    className={`w-full text-left px-4 py-3 flex items-center justify-between hover:bg-white/10 transition-colors ${
                      selected ? 'bg-cyan-500/20' : ''
                    }`}
                    whileHover={{ x: 4 }}
                  >
                    <div>
                      <div className="text-white font-medium">
                        {member.firstName} {member.lastName}
                      </div>
                      <div className="text-sm text-gray-400">{member.identifier}</div>
                    </div>
                    {selected && (
                      <Check className="w-5 h-5 text-cyan-400" />
                    )}
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {loading && (
        <div className="mt-4 text-center text-gray-400 text-sm">Loading...</div>
      )}

      {!loading && members.length === 0 && (
        <div className="mt-4 text-center text-gray-400 text-sm">
          No employees found
        </div>
      )}
    </div>
  );
};

export default EmployeeSelector;

