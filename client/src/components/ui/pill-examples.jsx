// Example usage of Pill components

import React, { useState } from 'react';
import { 
  Pill, 
  StatusPill, 
  CategoryPill, 
  TypePill, 
  PriorityPill, 
  TagPill,
  InteractivePill,
  PillGroup 
} from './pill';
import { Star, Heart, ShoppingCart } from 'lucide-react';

export const PillExamples = () => {
  const [selectedTags, setSelectedTags] = useState(['react', 'javascript']);

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <div className="space-y-8 p-6">
      {/* Basic Pills */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Basic Pills</h3>
        <PillGroup>
          <Pill variant="default">Default</Pill>
          <Pill variant="primary">Primary</Pill>
          <Pill variant="success">Success</Pill>
          <Pill variant="warning">Warning</Pill>
          <Pill variant="danger">Danger</Pill>
          <Pill variant="info">Info</Pill>
        </PillGroup>
      </section>

      {/* Sizes */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Sizes</h3>
        <PillGroup>
          <Pill size="xs" variant="primary">Extra Small</Pill>
          <Pill size="sm" variant="primary">Small</Pill>
          <Pill size="md" variant="primary">Medium</Pill>
          <Pill size="lg" variant="primary">Large</Pill>
          <Pill size="xl" variant="primary">Extra Large</Pill>
        </PillGroup>
      </section>

      {/* With Icons */}
      <section>
        <h3 className="text-lg font-semibold mb-4">With Icons</h3>
        <PillGroup>
          <Pill variant="primary" icon={<Star className="w-3 h-3" />}>Starred</Pill>
          <Pill variant="success" icon={<Heart className="w-3 h-3" />}>Liked</Pill>
          <Pill variant="warning" icon={<ShoppingCart className="w-3 h-3" />}>Cart</Pill>
        </PillGroup>
      </section>

      {/* Removable Pills */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Removable Pills</h3>
        <PillGroup>
          <Pill 
            variant="primary" 
            removable 
            onRemove={() => alert('Remove tag')}
          >
            React
          </Pill>
          <Pill 
            variant="success" 
            removable 
            onRemove={() => alert('Remove tag')}
          >
            TypeScript
          </Pill>
          <Pill 
            variant="info" 
            removable 
            onRemove={() => alert('Remove tag')}
          >
            Next.js
          </Pill>
        </PillGroup>
      </section>

      {/* Outline Variants */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Outline Variants</h3>
        <PillGroup>
          <Pill variant="outline-primary">Primary</Pill>
          <Pill variant="outline-success">Success</Pill>
          <Pill variant="outline-warning">Warning</Pill>
          <Pill variant="outline-danger">Danger</Pill>
        </PillGroup>
      </section>

      {/* Solid Variants */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Solid Variants</h3>
        <PillGroup>
          <Pill variant="solid-primary">Primary</Pill>
          <Pill variant="solid-success">Success</Pill>
          <Pill variant="solid-warning">Warning</Pill>
          <Pill variant="solid-danger">Danger</Pill>
        </PillGroup>
      </section>

      {/* Specialized Components */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Status Pills</h3>
        <PillGroup>
          <StatusPill status="active" />
          <StatusPill status="pending" />
          <StatusPill status="completed" />
          <StatusPill status="cancelled" />
        </PillGroup>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Category Pills</h3>
        <PillGroup>
          <CategoryPill category="Groceries" />
          <CategoryPill category="Dining" />
          <CategoryPill category="Transportation" />
          <CategoryPill category="Entertainment" />
        </PillGroup>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Transaction Type Pills</h3>
        <PillGroup>
          <TypePill type="income" />
          <TypePill type="expense" />
          <TypePill type="transfer" />
        </PillGroup>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Priority Pills</h3>
        <PillGroup>
          <PriorityPill priority="low" />
          <PriorityPill priority="medium" />
          <PriorityPill priority="high" />
          <PriorityPill priority="urgent" />
        </PillGroup>
      </section>

      {/* Interactive Pills */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Interactive Pills (Tags)</h3>
        <PillGroup>
          {['react', 'javascript', 'typescript', 'css', 'html'].map(tag => (
            <InteractivePill
              key={tag}
              selected={selectedTags.includes(tag)}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </InteractivePill>
          ))}
        </PillGroup>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Selected: {selectedTags.join(', ')}
        </p>
      </section>

      {/* Tag Pills with Colors */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Colored Tag Pills</h3>
        <PillGroup>
          {['Design', 'Frontend', 'Backend', 'Database', 'DevOps', 'Testing', 'Mobile'].map((tag, index) => (
            <TagPill key={tag} tag={tag} colorIndex={index} />
          ))}
        </PillGroup>
      </section>
    </div>
  );
};

// Financial Dashboard specific examples
export const FinancialPillExamples = () => {
  return (
    <div className="space-y-6 p-6">
      <h2 className="text-xl font-bold">Financial Dashboard Pills</h2>
      
      {/* Transaction Categories */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Transaction Categories</h3>
        <PillGroup>
          <CategoryPill category="Groceries" />
          <CategoryPill category="Dining" />
          <CategoryPill category="Transportation" />
          <CategoryPill category="Utilities" />
          <CategoryPill category="Entertainment" />
          <CategoryPill category="Healthcare" />
          <CategoryPill category="Shopping" />
          <CategoryPill category="Education" />
          <CategoryPill category="Uncategorized" />
        </PillGroup>
      </section>

      {/* Transaction Types */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Transaction Types</h3>
        <PillGroup>
          <TypePill type="income" />
          <TypePill type="expense" />
          <TypePill type="transfer" />
        </PillGroup>
      </section>

      {/* Account Types */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Account Types</h3>
        <PillGroup>
          <Pill variant="primary">Checking</Pill>
          <Pill variant="success">Savings</Pill>
          <Pill variant="warning">Credit Card</Pill>
          <Pill variant="info">Investment</Pill>
          <Pill variant="purple">Loan</Pill>
        </PillGroup>
      </section>

      {/* Financial Health */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Financial Health</h3>
        <PillGroup>
          <Pill variant="solid-success">Excellent</Pill>
          <Pill variant="success">Good</Pill>
          <Pill variant="warning">Fair</Pill>
          <Pill variant="danger">Poor</Pill>
        </PillGroup>
      </section>
    </div>
  );
};